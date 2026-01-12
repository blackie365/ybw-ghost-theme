# Member Spotlight Carousel - Deployment Guide
**Component**: Homepage Member Spotlight Carousel  
**Template**: `templates/home-hbs-member-spotlight.hbs`  
**Date**: January 12, 2025

## Overview

This guide explains how to deploy the Member Spotlight carousel to your Ghost homepage. The carousel automatically rotates through 8 featured members with large profile photos, bios, and social links.

## What It Does

- **Auto-rotates** through 8 randomly selected members every 6 seconds
- **Manual navigation** with prev/next arrows and clickable dots
- **Responsive design** adapts to desktop, tablet, and mobile
- **Dark mode support** using Ghost theme variables
- **Filters members** to show only complete profiles (photo, name, headline, bio)

## Prerequisites

- SSH access to your Ghost server
- Ghost theme files accessible
- Member Spotlight template file: `templates/home-hbs-member-spotlight.hbs`

## Deployment Steps

### Step 1: Locate Your Ghost Theme

Find your active Ghost theme directory:

```bash
# Navigate to Ghost themes directory
cd /var/www/ghost/content/themes

# List themes
ls -la

# Identify your active theme (check Ghost Admin > Settings > Design)
# Likely named something like: casper, edition, or custom theme name
```

### Step 2: Backup Current home.hbs

Before making changes, create a backup:

```bash
# Navigate to your theme directory
cd /var/www/ghost/content/themes/YOUR-THEME-NAME

# Backup home.hbs
cp home.hbs home.hbs.backup-$(date +%Y%m%d)

# Verify backup created
ls -la home.hbs*
```

### Step 3: Open home.hbs for Editing

```bash
# Open with your preferred editor
nano home.hbs
# or
vim home.hbs
# or
code home.hbs  # if using VS Code Remote
```

### Step 4: Choose Insertion Location

You have two options:

#### Option A: Add as Prominent Hero Section (Recommended)
Insert near the top of the page, after the main header/hero:

```handlebars
{{!< default}}

<main class="gh-main">
    
    {{!-- EXISTING HERO/HEADER CONTENT --}}
    
    {{!-- INSERT MEMBER SPOTLIGHT HERE --}}
    <!-- Member Spotlight Carousel -->
    [PASTE CONTENT FROM home-hbs-member-spotlight.hbs]
    
    {{!-- REST OF HOMEPAGE CONTENT --}}
    
</main>
```

#### Option B: Replace Existing 4-Thumbnail Widget
If you already have the 4-thumbnail member widget, replace it entirely:

```handlebars
{{!-- REMOVE OLD CODE --}}
<!-- Old member thumbnails section -->
<section class="members-widget">
    ... existing widget code ...
</section>

{{!-- REPLACE WITH NEW SPOTLIGHT --}}
<!-- Member Spotlight Carousel -->
[PASTE CONTENT FROM home-hbs-member-spotlight.hbs]
```

### Step 5: Copy Template Content

Copy the entire content of `templates/home-hbs-member-spotlight.hbs` and paste it into your chosen location in `home.hbs`.

**Important**: The template includes:
- HTML structure (`<section>` with carousel)
- CSS styles (`<style>` block)
- JavaScript (`<script>` block wrapped in `{{{{raw}}}}`)

Make sure to copy **all three parts** together.

### Step 6: Save and Exit

```bash
# If using nano:
# Press Ctrl+O to save, then Ctrl+X to exit

# If using vim:
# Press Esc, type :wq, press Enter
```

### Step 7: Restart Ghost

```bash
# Restart Ghost service
sudo systemctl restart ghost_topicuk-woman-co-uk

# Verify Ghost is running
sudo systemctl status ghost_topicuk-woman-co-uk

# Check for errors in logs if needed
sudo journalctl -u ghost_topicuk-woman-co-uk -n 50
```

### Step 8: Test the Carousel

1. **Visit your homepage** in a browser
2. **Check for the Member Spotlight section** near the top
3. **Verify functionality**:
   - Carousel auto-rotates every 6 seconds
   - Previous/Next arrows work
   - Navigation dots are clickable
   - Member photos, names, headlines display correctly
   - Social links (website, LinkedIn) work
   - Responsive on mobile (check with DevTools)
4. **Test dark mode** (if your theme supports it)

## Troubleshooting

### Carousel Not Appearing

**Problem**: Nothing shows up on the homepage.

**Solutions**:
1. Check browser console for JavaScript errors (F12 → Console)
2. Verify you copied the entire template (HTML + CSS + JS)
3. Check Ghost logs: `sudo journalctl -u ghost_topicuk-woman-co-uk -n 50`
4. Ensure Ghost restarted successfully

### API Error in Console

**Problem**: Console shows "Error loading member spotlight"

**Solutions**:
1. Verify API endpoint is accessible: `https://getdata-bd3qt5x3dq-uc.a.run.app/getData?collection=myCollection`
2. Test in browser or with curl:
   ```bash
   curl "https://getdata-bd3qt5x3dq-uc.a.run.app/getData?collection=myCollection"
   ```
3. Check CORS settings if API blocks request

### Styling Issues

**Problem**: Carousel appears but looks broken or unstyled

**Solutions**:
1. Verify `<style>` block was copied
2. Check for CSS conflicts with theme styles
3. Inspect element in DevTools to see which styles are applied
4. Ensure CSS variables are defined in your theme (e.g., `--text-color-0`)

### Dark Mode Not Working

**Problem**: Carousel doesn't adapt to dark mode

**Solutions**:
1. Verify your theme uses `[data-color-scheme="dark"]` attribute
2. Check if theme defines dark mode CSS variables
3. Inspect `<html>` or `<body>` tag for dark mode class/attribute

### Carousel Doesn't Auto-Rotate

**Problem**: Slides don't advance automatically

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify `{{{{raw}}}}` tags are present around `<script>` block
3. Ensure no JavaScript conflicts with other scripts

### No Members Show Up

**Problem**: Carousel loads but shows empty slides

**Solutions**:
1. Check API returns data (see "API Error" troubleshooting)
2. Verify members have complete profiles:
   - Avatar URL
   - First Name
   - Headline
   - Bio
3. Lower `NUM_SPOTLIGHT_MEMBERS` in script if fewer than 8 complete profiles

## Customization Options

### Change Number of Members

Edit the JavaScript in the template:

```javascript
var NUM_SPOTLIGHT_MEMBERS = 8; // Change to 4, 6, 10, etc.
```

### Change Rotation Speed

```javascript
var ROTATION_DELAY = 6000; // Change to 5000 (5s), 8000 (8s), etc.
```

### Change Profile Photo Size

Edit the CSS:

```css
.spotlight-image-container {
    width: 300px;    /* Change to 250px, 350px, etc. */
    height: 300px;
}
```

### Show Different Members Each Visit

The carousel already randomizes member selection. To make it static, remove the `shuffleArray()` call in the JavaScript.

## Rollback Procedure

If you need to revert to the original homepage:

```bash
# Navigate to theme directory
cd /var/www/ghost/content/themes/YOUR-THEME-NAME

# Restore backup
cp home.hbs.backup-YYYYMMDD home.hbs

# Restart Ghost
sudo systemctl restart ghost_topicuk-woman-co-uk
```

## Performance Notes

- **API calls**: One fetch per page load (~250KB response)
- **Images**: Lazy-loaded with `loading="lazy"` attribute
- **Auto-rotation**: Uses `setInterval`, minimal CPU usage
- **Caching**: Browser caches API response and images

## Future Enhancements

Once API v2 is implemented (Phase 1.3), you can upgrade the carousel to use:

```javascript
// Future API endpoint (when implemented)
var apiUrl = 'https://YOUR-API-URL/api/v2/members/featured?limit=8&random=true';
```

This will:
- Reduce payload size (only featured members)
- Server-side randomization
- Faster loading times

## Support

If you encounter issues:
1. Check Ghost logs: `sudo journalctl -u ghost_topicuk-woman-co-uk -n 100`
2. Test API manually: `curl https://getdata-bd3qt5x3dq-uc.a.run.app/getData?collection=myCollection`
3. Review browser console for JavaScript errors
4. Compare your edited `home.hbs` with the backup

---

**Deployment Guide Version**: 1.0  
**Template File**: `templates/home-hbs-member-spotlight.hbs`  
**Last Updated**: January 12, 2025
