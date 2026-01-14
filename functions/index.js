/**
 * Yorkshire Businesswoman - Firebase Cloud Functions
 * // Force redeploy: 1736782782
 *
 * Ghost Webhook Integration:
 * - Syncs Ghost members to Firestore with enhanced schema
 * - Handles member.added, member.edited, member.deleted events
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// For cost control
setGlobalOptions({maxInstances: 10});

/**
 * Ghost Webhook Handler
 *
 * Receives webhooks from Ghost when members are created, updated, or deleted
 * Maps Ghost member data to Firebase enhanced schema
 */
exports.ghostWebhook = onRequest({cors: true}, async (req, res) => {
  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // Get action from query parameter
    const action = req.query.action;
    if (!action || !["created", "updated", "deleted"].includes(action)) {
      return res.status(400).send("Invalid or missing action parameter");
    }

    // Parse Ghost webhook payload
    // Ghost sends: {member: {...}} or {member: {current/previous}}
    const payload = req.body;
    let member = null;

    if (payload && payload.member) {
      // For delete events: use previous (current is empty object)
      const currentEmpty = !payload.member.current ||
        Object.keys(payload.member.current).length === 0;
      if (payload.member.previous && currentEmpty) {
        member = payload.member.previous;
      } else if (payload.member.current) {
        // For create/update: use current
        member = payload.member.current;
      } else if (payload.member.id) {
        // Fallback: direct member object
        member = payload.member;
      }
    }

    if (!member || !member.id) {
      logger.error("Invalid webhook payload", payload);
      return res.status(400).send("Invalid payload: missing member data");
    }

    logger.info(`Ghost webhook: ${action} for member ${member.email}`);

    // Get Firestore reference
    const db = admin.firestore();
    const memberRef = db.collection("newMemberCollection").doc(member.id);

    // Handle different actions
    if (action === "created") {
      const memberData = mapGhostToFirebase(member);
      logger.info(`About to create member with data:`,
          {email: member.email, id: member.id});

      await memberRef.set(memberData);

      logger.info(`Successfully created member: ${member.email}`);

      // Verify it was written
      const doc = await memberRef.get();
      if (doc.exists) {
        logger.info(
            `Verified: Document exists in Firestore for ${member.email}`,
        );
      } else {
        logger.error(
            `ERROR: Document NOT found after set() for ${member.email}`,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Member created successfully",
        memberId: member.id,
      });
    } else if (action === "updated") {
      const memberData = mapGhostToFirebase(member);
      await memberRef.set(memberData, {merge: true});
      logger.info(`Updated member: ${member.email}`);
      return res.status(200).json({
        success: true,
        message: "Member updated successfully",
        memberId: member.id,
      });
    } else if (action === "deleted") {
      await memberRef.delete();
      logger.info(`Deleted member: ${member.email} (ID: ${member.id})`);
      return res.status(200).json({
        success: true,
        message: "Member deleted successfully",
        memberId: member.id,
      });
    }
  } catch (error) {
    logger.error("Ghost webhook error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Map Ghost member fields to Firebase enhanced schema
 * @param {Object} ghostMember - Ghost member object from webhook
 * @return {Object} Firebase member object
 */
function mapGhostToFirebase(ghostMember) {
  const nameParts = (ghostMember.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    "id": ghostMember.id,
    "uid": ghostMember.id,
    "Email": ghostMember.email,
    "First Name": firstName,
    "Last Name": lastName,
    "searchName": (ghostMember.name || "").toLowerCase(),
    "Avatar URL": ghostMember.avatar_image || "",
    "Headline": "",
    "Bio": "",
    "Location": "",
    "Join Date": ghostMember.created_at || new Date().toISOString(),
    "Last Active": new Date().toISOString(),
    "Active": ghostMember.status === "paid" ? "true" : "false",
    "Member status": ghostMember.status || "free",
    "Email marketing": ghostMember.subscribed ? "true" : "false",
    "UID": ghostMember.id,
    "Website": "",
    "LinkedIn URL": "",
    "Instagram URL": "",
    "Facebook URL": "",
    "Twitter URL": "",
    "Profile URL": "",
    "Posts": "0",
    "Comments": "0",
    "Likes": "0",
    "Gamification level": "1",
    "Tags": ghostMember.labels ?
      JSON.stringify(ghostMember.labels.map((l) => l.name)) :
      JSON.stringify(["Members"]),
    "memberSlug": generateSlug(firstName, lastName),
    "featured": false,
    "category": "Other",
    "services": [],
    "profileViews": 0,
    "lastUpdated": new Date().toISOString(),
  };
}

/**
 * Generate URL-friendly slug from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @return {string} URL-friendly slug
 */
function generateSlug(firstName, lastName) {
  const slug = `${firstName}-${lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  return slug || "member";
}

/**
 * Members API v2
 *
 * GET /getMembersV2
 * Query parameters:
 * - limit: number of results (default 20, max 100)
 * - offset: pagination offset (default 0)
 * - keyword: filter by tag/keyword
 * - featured: filter featured members (true/false)
 * - search: search by name
 * - sort: alphabetical|newest|mostViewed (default alphabetical)
 * - includeNoAvatar: include members without avatars (default false)
 */
exports.getMembersV2 = onRequest({cors: true}, async (req, res) => {
  try {
    // Only accept GET requests
    if (req.method !== "GET") {
      return res.status(405).json({error: "Method Not Allowed"});
    }

    // Parse query parameters
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const keyword = req.query.keyword;
    const featured = req.query.featured === "true";
    const search = req.query.search;
    const sort = req.query.sort || "alphabetical";
    const includeNoAvatar = req.query.includeNoAvatar === "true";

    // Get all members (we'll do filtering/sorting client-side)
    // This is fine for 210 members, but would need optimization for 1000+
    const db = admin.firestore();
    const snapshot = await db.collection("newMemberCollection").get();

    // Map to array
    let members = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter out members without avatars (unless explicitly requested)
    if (!includeNoAvatar) {
      members = members.filter((m) => {
        const avatar = m["Avatar URL"] || "";
        // Keep if has non-empty avatar and not a gravatar default
        return avatar && !avatar.includes("?d=blank");
      });
    }

    // Apply keyword/tag filter
    if (keyword) {
      members = members.filter((m) => {
        try {
          const tags = m.Tags ? JSON.parse(m.Tags) : [];
          return tags.some((tag) =>
            tag.toLowerCase().includes(keyword.toLowerCase()));
        } catch (e) {
          return false;
        }
      });
    }

    // Apply featured filter
    if (featured) {
      members = members.filter((m) => m.featured === true);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      members = members.filter((m) => {
        const firstName = m["First Name"] || "";
        const lastName = m["Last Name"] || "";
        const email = m.Email || "";
        const fullName = (firstName + " " + lastName).trim().toLowerCase();
        return fullName.includes(searchLower) ||
               email.toLowerCase().includes(searchLower);
      });
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        members.sort((a, b) => {
          const dateA = new Date(a["Join Date"] || 0);
          const dateB = new Date(b["Join Date"] || 0);
          return dateB - dateA; // desc
        });
        break;
      case "mostViewed":
        members.sort((a, b) =>
          (b.profileViews || 0) - (a.profileViews || 0));
        break;
      case "alphabetical":
      default:
        members.sort((a, b) => {
          const nameA = ((a["First Name"] || "") + " " +
                        (a["Last Name"] || "")).trim().toLowerCase();
          const nameB = ((b["First Name"] || "") + " " +
                        (b["Last Name"] || "")).trim().toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
    }

    // Get total after filters
    const totalAfterFilters = members.length;

    // Apply pagination
    const paginatedMembers = members.slice(offset, offset + limit);

    // Return response with metadata
    return res.status(200).json({
      members: paginatedMembers,
      metadata: {
        total: totalAfterFilters,
        limit,
        offset,
        count: paginatedMembers.length,
        hasMore: offset + paginatedMembers.length < totalAfterFilters,
      },
    });
  } catch (error) {
    logger.error("API v2 error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});
