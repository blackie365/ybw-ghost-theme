# Homa Theme Guide

Welcome to Homa! This guide helps you install, customize, and get the most out of your new Ghost theme.

If you're new to Ghost, you might find the [official Ghost documentation](https://ghost.org/docs/) helpful.

## Installation and Updates

### Installing the Theme

Follow these steps to add Homa to your Ghost site:

1.  Log in to your Ghost Admin.
2.  Go to `Settings` > `Design & branding` > `Customize`.
3.  Click `Change theme` (bottom right).
4.  Select `Upload theme` and choose the `Homa.zip` file you downloaded.
5.  Once uploaded, click `Activate`.

### Removing the Theme

If you need to remove Homa:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Click `Change theme`.
3.  Find Homa in the list. Before deleting, activate a different theme (you can't delete an active theme).
4.  Click the `...` menu next to Homa and select `Delete`. Confirm the deletion.

### Updating the Theme

Keep Homa up-to-date with the latest features and improvements:

1.  Download the latest version of the Homa theme zip file.
2.  Go to `Settings` > `Design & branding` > `Customize`.
3.  Click `Change theme`.
4.  Select `Upload theme` and choose the new `Homa.zip` file.
5.  Activate the updated theme.

**Important:** Updating overwrites any direct code changes you've made to theme files. If you've customized the code, back up your changes before updating.

## Customization

### Logo

Set your site's logo for branding:

1.  Go to `Settings` > `Design & branding`.
2.  Under `Brand`, find `Publication logo`.
3.  Click `Upload logo` and select your image file. Use a transparent background (like `.png`) for best results.
4.  Click `Save`.

If you plan to use dark mode (see Color Scheme section), you can add a separate logo optimized for dark backgrounds:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Find `Logo for dark color scheme`.
3.  Upload your dark mode logo variant.
4.  Click `Save`.

### Copyright Text

Customize the copyright notice shown in your site footer:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Find `Copyright text`.
3.  Enter your desired copyright information (e.g., `© 2024 Your Site Name. All rights reserved.`).
4.  Click `Save`.

If left empty, the default "© [Year] Published with Ghost" will be displayed.

### Color Scheme

Choose how your site handles light and dark modes:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Expand the `Site-wide` section.
3.  Find `Color scheme` and choose:
    *   **Light:** Always use the light theme.
    *   **Dark:** Always use the dark theme.
    *   **System:** Automatically match the visitor's device setting.
4.  Click `Save`.

You can also allow visitors to switch modes themselves:

1.  Find `Show color scheme switcher`.
2.  Toggle it on to display a switcher icon in the site header.
3.  Click `Save`.

### Force Dark Header & Footer

You can choose to always display the site header and footer using the dark color scheme, even if the rest of the site is set to light or system mode.

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Expand the `Site-wide` section.
3.  Find `Use dark color scheme for header and footer`.
4.  Toggle the setting on if you want the header and footer to always be dark.
5.  Click `Save`.

This provides contrast and can help visually anchor the top and bottom of your pages.

### Fonts

Homa integrates with Ghost's native font system and also includes built-in options.

**Using Ghost Native Fonts (Recommended)**

Available in Ghost 5.104.0+, this method provides the best control and consistency:

1.  Ensure you're using a recent version of Homa and Ghost.
2.  Go to `Settings` > `Design & branding`.
3.  Under `Brand`, find the `Typography` section.
4.  Select your desired heading and body fonts.
5.  Click `Save`.

These settings automatically override the theme's specific font settings.

**Using Theme Font Settings**

If you prefer not to use Ghost's native system:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Expand the `Site-wide` section.
3.  Use the `Heading font family` and `Body font family` dropdowns to select fonts.
4.  Click `Save`.

**Available Theme Fonts:**

| Heading Fonts     | Body Fonts        |
| :---------------- | :---------------- |
| Cardo             | Fira Mono         |
| Chakra Petch      | Fira Sans         |
| Fira Mono         | IBM Plex Serif    |
| Fira Sans         | Inter             |
| IBM Plex Serif    | JetBrains Mono    |
| Inter             | Lora              |
| JetBrains Mono    | Manrope           |
| Libre Baskerville | Merriweather      |
| Lora              | Noto Sans         |
| Manrope           | Noto Serif        |
| Merriweather      | Nunito            |
| Noto Sans         | Old Standard TT   |
| Noto Serif        | Poppins           |
| Nunito            | Roboto            |
| Poppins           | Rufina            |
| Roboto            | Space Grotesk     |
| Space Mono        | Space Mono        |
| Tenor Sans        | Tenor Sans        |

### Social Media Links

Display social media icons in your site footer:

**Facebook and X (formerly Twitter):**

1.  Go to `Settings` > `General`.
2.  Scroll to `Social accounts`.
3.  Enter your Facebook page URL and X profile URL.
4.  Click `Save`.

**Other Platforms (Instagram, LinkedIn, etc.):**

1.  Go to `Settings` > `Code injection`.
2.  In the `Site Header` box, add the following script, modifying the links and adding platforms as needed:

   ```html
   <script>
     // Add links for the social platforms you want to display
     window.social = {
       instagram: "https://instagram.com/your_username",
       linkedin: "https://linkedin.com/in/your_profile",
       youtube: "https://youtube.com/your_channel",
       pinterest: "https://pinterest.com/your_username",
       // Add other supported platforms below
     };
   </script>
   ```
3.  Click `Save`.

**Supported Platforms for Code Injection:**

Use the lowercase platform name as the key (e.g., `instagram`, `linkedin`).

|           |             |           |
| :-------- | :---------- | :-------- |
| Behance   | Facebook    | Pinterest |
| Bluesky   | Flickr      | Reddit    |
| Deezer    | Instagram   | Snapchat  |
| Diaspora  | Kickstarter | Spotify   |
| Discord   | Line        | Telegram  |
| Dribbble  | LinkedIn    | Threads   |
| Mastodon  | TikTok      | Weibo     |
| OK        | Twitch      | WhatsApp  |
| Patreon   | Vimeo       | X         |
| Xing      | YouTube     | Yelp      |
| Zhihu     |             |           |

### Primary Navigation (Header)

Configure the main menu displayed in your site header:

1.  Go to `Settings` > `Navigation`.
2.  Edit items under `Primary navigation`.
3.  To create dropdown submenus:
    *   Add a main item (e.g., `Resources`). Set its URL to `#`.
    *   Add sub-items directly below it, prefixing their labels with a dash `-` (e.g., `- Documentation`, `- Tutorials`). Assign actual URLs to these sub-items.
4.  Click `Save`.

On smaller screens, menu items that don't fit horizontally will automatically appear under a "More" dropdown.

### Secondary Navigation (Footer)

Configure the links displayed in your site footer, organized into columns:

1.  Go to `Settings` > `Navigation`.
2.  Edit items under `Secondary navigation`.
3.  To create columns:
    *   Add a column header item (e.g., `Company`). Set its URL to `#`.
    *   Add the links for that column directly below the header (e.g., `About Us`, `Contact`).
    *   Add another header item with URL `#` to start the next column (e.g., `Legal`).
    *   Add links for the second column below its header (e.g., `Privacy Policy`, `Terms of Service`).
4.  Click `Save`.

Links to external websites will automatically open in a new tab and show an indicator icon.

### Content Loading (Pagination)

Homa uses a "Load More" button for browsing posts:

*   Visitors click `Load More` at the bottom of post lists.
*   The next set of posts loads smoothly onto the current page.
*   A "You're all caught up." message appears when all posts are loaded.

### Installable App (PWA)

Allow visitors to install your site like an app on their mobile devices (Progressive Web App):

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Find `Enable app mode` under `Site-wide`.
3.  Toggle it on.
4.  Click `Save`.

Compatible mobile browsers will prompt visitors to add the site to their home screen.

## Homepage Setup

### Featured Posts Section

Highlight key posts on your homepage:

1.  Ensure the posts you want to feature are marked as "featured". Edit a post, open the post settings (gear icon), and toggle `Feature this post` on.
2.  Go to `Settings` > `Design & branding` > `Customize`.
3.  Expand the `Homepage` section.
4.  Toggle `Show Featured Posts Section` on or off.
5.  Click `Save`.

**Hiding Featured Posts from Main Listings (Advanced)**

If you want featured posts to appear *only* in the featured section and not in the main post list, you can modify your site's routing:

1.  Go to `Settings` > `Labs` in Ghost Admin.
2.  Under `Beta features`, find the `Routes` section.
3.  Download your current `routes.yaml` file (if one exists) as a backup.
4.  Upload a new `routes.yaml` file with the following content:

   ```yaml
   routes:
     # Define custom routes here if needed

   collections:
     /:
       permalink: /{slug}/
       filter: featured:false  # Exclude featured posts from the main collection
       template: index
     /featured/:
       permalink: /featured/{slug}/
       filter: featured:true     # Create a separate collection for featured posts
       template: index         # Or use a custom template if desired

   taxonomies:
     tag: /tag/{slug}/
     author: /author/{slug}/
   ```
5.  Save the changes. Featured posts will now be excluded from the main `/` collection.

### Homepage Tag Sections

Display dedicated sections on your homepage for specific tags you choose:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Under `Homepage`, find `Homepage tags`.
3.  Enter a comma-separated list of tag slugs you want to display sections for (e.g., `interviews, tutorials, analysis`).
4.  Click `Save`.

For each tag listed, a section will appear on the homepage showing the tag name (linking to the tag page), its description (if available), and the latest posts with that tag.

### Highlighted Tag Section

Showcase posts from a specific tag in a dedicated homepage section:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Under `Homepage`, find `Highlighted tag`.
3.  Enter the slug of the tag you want to highlight (e.g., `news`, `case-studies`).
4.  Click `Save`.

For the best appearance, edit the highlighted tag itself (under `Tags` in Ghost Admin) and add a `Description` and `Feature image`. The tag's accent color (if set) will also be used.

### Homepage Authors Section

Optionally display a list of authors on the homepage:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Under `Homepage`, find `Show authors list on home page`.
3.  Toggle it on or off.
4.  Click `Save`.

Ensure author profiles are complete (image, bio) for the best appearance. See the `Authors Page` template section for details.

## Post Settings

### Post Layouts

Choose how a post's feature image and content are arranged:

1.  Edit a post in Ghost Admin.
2.  Open the post settings (gear icon).
3.  Under `Template`, choose from:
    *   `Text First` (Default): Content appears above the feature image.
    *   `Image Left`: Feature image on the left, title/meta on the right.
    *   `Image Right`: Title/meta on the left, feature image on the right.
    *   `Full Width Image`: Large feature image above the title/meta.
4.  Click `Update`.

### Scroll Indicator

Show a progress bar indicating reading progress within posts:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Expand the `Post` section.
3.  Toggle `Enable Scroll Indicator` on or off.
4.  Click `Save`.

### Post Suggestions

Display related posts at the bottom of each article:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Under `Post`, toggle `Show post suggestions` on or off.
3.  Click `Save`.

### Comments

Enable Ghost's built-in commenting system:

1.  Go to `Settings` > `Membership`.
2.  Under `Access`, click `Edit` for `Commenting`.
3.  Choose who can comment (Nobody, All members, Paid members).
4.  Click `Save`.

### Syntax Highlighting

Automatically format code blocks for readability:

1.  Go to `Settings` > `Design & branding` > `Customize`.
2.  Under `Post`, toggle `Enable Syntax Highlighting` on or off.
3.  Click `Save`.

## Page Templates

Homa includes several templates for creating custom pages.

### Authors Page

Create a page listing all site authors with their profiles:

1.  Create a new page in Ghost Admin (e.g., title "Our Team").
2.  Open page settings (gear icon).
3.  Under `Template`, select `Authors`.
4.  Publish the page.

Ensure author profiles in `Staff` settings have a profile image, bio, and any relevant social links filled out.

### Tags Page

Create a page listing all tags used on your site:

1.  Create a new page (e.g., title "Topics").
2.  Open page settings.
3.  Under `Template`, select `Tags`.
4.  Publish the page.

Add this page to your site navigation for easy access. For best results, ensure your tags have descriptions and feature images set under `Tags` in Ghost Admin.

### Contact Page

Add a contact form to your site:

1.  Sign up for a form service like [Formspree](https://formspree.io/) or [Getform](https://getform.io/) and get your unique form endpoint URL.
2.  Go to `Settings` > `Design & branding` > `Customize`.
3.  Under `Site-wide`, find `Contact form url`.
4.  Paste your form endpoint URL.
5.  Click `Save`.
6.  Create a new page (e.g., title "Contact Us").
7.  Add any introductory text or contact details in the page editor.
8.  Open page settings.
9.  Under `Template`, select `Contact`.