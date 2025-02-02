async function loadMarkdown(file) {
    try {
        console.log(`Loading ${file}...`);

        // Store the current scroll position before updating content
        const scrollPosition = window.scrollY;
        const markdownContainer = document.getElementById("markdown-content");

        // Prevent height collapse during content update
        markdownContainer.style.minHeight = `${markdownContainer.clientHeight}px`;

        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`Failed to load ${file}. HTTP status: ${response.status}`);
        }

        // Convert Markdown to HTML
        const text = await response.text();
        const htmlContent = marked.parse(text);

        // Use a DocumentFragment to update content smoothly (prevents reflow)
        const range = document.createRange();
        range.selectNodeContents(markdownContainer);
        const fragment = range.createContextualFragment(htmlContent);

        // Replace content without causing a full re-render
        markdownContainer.innerHTML = "";
        markdownContainer.appendChild(fragment);

        // Apply syntax highlighting using Prism.js
        document.querySelectorAll("#markdown-content pre code").forEach((block) => {
            Prism.highlightElement(block);
        });

        // Group consecutive images into a flex container
        formatImages();

        // Hide overviews and show dynamic content
        document.getElementById("preprocessing-overview").style.display = "none";
        document.getElementById("ml-overview").style.display = "none";
        document.getElementById("dynamic-content").style.display = "block";

        // Restore auto height after new content is loaded
        markdownContainer.style.minHeight = "auto";

        // Push to history API so the back button works properly
        history.pushState({ markdownFile: file, scrollY: scrollPosition }, "", `#${file}`);

    } catch (error) {
        console.error(error);
        document.getElementById("markdown-content").innerHTML = "<p>Error loading content. Please try again.</p>";
    }
}


function formatImages() {
    const markdownContent = document.getElementById("markdown-content");
    const images = markdownContent.querySelectorAll("img");

    if (images.length > 1) {
        let container = document.createElement("div");
        container.className = "image-container";

        images.forEach((img) => {
            container.appendChild(img);
        });

        // Insert the container before the first image's parent
        markdownContent.insertBefore(container, images[0]);
    }
}

// Function to show overviews again
function showOverviews() {
    document.getElementById("preprocessing-overview").style.display = "block";
    document.getElementById("ml-overview").style.display = "block";
    document.getElementById("dynamic-content").style.display = "none";
}
