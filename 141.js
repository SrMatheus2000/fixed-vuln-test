function unique_name_76 () {
        // Append the SVG dom to the document.
        // This allows us to use `getBBox` on the page,
        // which returns the full bounding-box of all drawn SVG
        // elements, similar to how Scratch 2.0 did measurement.
        const svgSpot = document.createElement('span');
        // Since we're adding user-provided SVG to document.body,
        // sanitizing is required. This should not affect bounding box calculation.
        // outerHTML is attribute of Element (and not HTMLElement), so use it instead of
        // calling serializer or toString()
        // NOTE: this._svgTag remains untouched!
        const rawValue = this._svgTag.outerHTML;
        const sanitizedValue = DOMPurify.sanitize(rawValue, {
            // Use SVG profile (no HTML elements)
            USE_PROFILES: {svg: true},
            // Remove some tags that Scratch does not use.
            FORBID_TAGS: ['a', 'audio', 'canvas', 'video'],
            // Allow data URI in image tags (e.g. SVGs converted from bitmap)
            ADD_DATA_URI_TAGS: ['image']
        });
        let bbox;
        try {
            // Insert sanitized value.
            svgSpot.innerHTML = sanitizedValue;
            document.body.appendChild(svgSpot);
            // Take the bounding box. We have to get elements via svgSpot
            // because we added it via innerHTML.
            bbox = svgSpot.children[0].getBBox();
        } finally {
            // Always destroy the element, even if, for example, getBBox throws.
            document.body.removeChild(svgSpot);
        }

        // Enlarge the bbox from the largest found stroke width
        // This may have false-positives, but at least the bbox will always
        // contain the full graphic including strokes.
        // If the width or height is zero however, don't enlarge since
        // they won't have a stroke width that needs to be enlarged.
        let halfStrokeWidth;
        if (bbox.width === 0 || bbox.height === 0) {
            halfStrokeWidth = 0;
        } else {
            halfStrokeWidth = this._findLargestStrokeWidth(this._svgTag) / 2;
        }
        const width = bbox.width + (halfStrokeWidth * 2);
        const height = bbox.height + (halfStrokeWidth * 2);
        const x = bbox.x - halfStrokeWidth;
        const y = bbox.y - halfStrokeWidth;

        // Set the correct measurements on the SVG tag
        this._svgTag.setAttribute('width', width);
        this._svgTag.setAttribute('height', height);
        this._svgTag.setAttribute('viewBox',
            `${x} ${y} ${width} ${height}`);
    }