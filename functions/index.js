/**
 * Yorkshire Businesswoman - Firebase Cloud Functions
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
 *
 * Usage:
 * POST https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/ghostWebhook?action=created
 * POST https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/ghostWebhook?action=updated
 * POST https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/ghostWebhook?action=deleted
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

    // Verify webhook signature (optional but recommended)
    // const signature = req.headers["x-ghost-signature"];
    // if (!verifyGhostSignature(signature, req.body)) {
    //   logger.warn("Invalid webhook signature");
    //   return res.status(401).send("Unauthorized");
    // }

    // Parse Ghost webhook payload
    const payload = req.body;
    const member = (payload && payload.member && payload.member.current) ||
                   (payload && payload.member) ||
                   null;

    if (!member || !member.id) {
      logger.error("Invalid webhook payload", payload);
      return res.status(400).send("Invalid payload: missing member data");
    }

    logger.info(`Ghost webhook: ${action} for member ${member.email}`);

    // Get Firestore reference
    const db = admin.firestore();
    const memberRef = db.collection("myCollection").doc(member.id);

    // Handle different actions
    if (action === "created") {
      // Create new member in Firestore
      const memberData = mapGhostToFirebase(member);
      await memberRef.set(memberData);
      logger.info(`Created member: ${member.email}`);
      return res.status(200).json({
        success: true,
        message: "Member created successfully",
        memberId: member.id,
      });
    } else if (action === "updated") {
      // Update existing member
      const memberData = mapGhostToFirebase(member);
      await memberRef.set(memberData, {merge: true});
      logger.info(`Updated member: ${member.email}`);
      return res.status(200).json({
        success: true,
        message: "Member updated successfully",
        memberId: member.id,
      });
    } else if (action === "deleted") {
      // Delete member from Firestore
      await memberRef.delete();
      logger.info(`Deleted member: ${member.email}`);
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
 *
 * @param {Object} ghostMember - Ghost member object from webhook
 * @return {Object} Firebase member object with enhanced schema
 */
function mapGhostToFirebase(ghostMember) {
  // Split name into first and last
  const nameParts = (ghostMember.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    // Core Identity
    "id": ghostMember.id,
    "uid": ghostMember.id,
    "Email": ghostMember.email,
    "First Name": firstName,
    "Last Name": lastName,
    "searchName": (ghostMember.name || "").toLowerCase(),

    // Profile (defaults - to be completed by user)
    "Avatar URL": ghostMember.avatar_image || "",
    "Headline": "", // To be filled via profile completion form
    "Bio": "", // To be filled via profile completion form
    "Location": "", // To be filled via profile completion form

    // Membership Data
    "Join Date": ghostMember.created_at || new Date().toISOString(),
    "Last Active": new Date().toISOString(),
    "Active": ghostMember.status === "paid" ? "true" : "false",
    "Member status": ghostMember.status || "free",
    "Email marketing": ghostMember.subscribed ? "true" : "false",
    "UID": ghostMember.id,

    // Social Links (empty by default)
    "Website": "",
    "LinkedIn URL": "",
    "Instagram URL": "",
    "Facebook URL": "",
    "Twitter URL": "",
    "Profile URL": "",

    // Engagement (defaults)
    "Posts": "0",
    "Comments": "0",
    "Likes": "0",
    "Gamification level": "1",

    // Tags from Ghost labels
    "Tags": ghostMember.labels ?
      JSON.stringify(ghostMember.labels.map((l) => l.name)) :
      JSON.stringify(["Members"]),

    // Enhanced Fields (defaults)
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
 *
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

// TODO: Implement webhook signature verification in production
// Uncomment and implement verifyGhostSignature() when ready
// to verify X-Ghost-Signature header using HMAC SHA256
