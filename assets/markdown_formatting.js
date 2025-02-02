// Function to load Markdown and replace overviews
async function loadMarkdown(file) {
    try {
        console.log(`Loading ${file}...`);
        const response = await fetch(file);

        if (!response.ok) {
            throw new Error(`Failed to load ${file}. HTTP status: ${response.status}`);
        }

        // Convert Markdown to HTML
        const text = await response.text();
        const htmlContent = marked.parse(text);

        // Insert parsed HTML into the markdown-content div
        document.getElementById("markdown-content").innerHTML = htmlContent;
        const markdownContainer = document.getElementById("markdown-content");
        markdownContainer.innerHTML = htmlContent;

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
