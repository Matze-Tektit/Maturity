/**
 * Unlock Results Handler
 * Removes lead gate, reveals locked preview, and triggers final analysis
 */
document.addEventListener("DOMContentLoaded", function() {
    const unlockBtn = document.getElementById("unlockResultsBtn");
    
    if (!unlockBtn) {
        console.warn("unlockResultsBtn not found in DOM");
        return;
    }
    
    unlockBtn.addEventListener("click", function() {
        console.log("Unlock clicked");
        
        // 1. Hide the lead gate container
        const leadGate = document.getElementById("leadGate");
        if (leadGate) {
            leadGate.style.display = "none";
            console.log("Lead gate hidden");
        } else {
            console.warn("leadGate element not found");
        }
        
        // 2. Remove blur effect from preview wrapper
        const previewWrapper = document.getElementById("lockedPreviewWrapper");
        if (previewWrapper) {
            previewWrapper.classList.remove("locked-preview");
            console.log("Blur effect removed from preview");
        } else {
            console.warn("lockedPreviewWrapper element not found");
        }
        
        // 3. Ensure results section is visible
        const resultsSection = document.getElementById("results");
        if (resultsSection) {
            resultsSection.style.display = "block";
            console.log("Results section is now visible");
        } else {
            console.warn("results section not found");
        }
        
        // 4. Trigger final analysis if function exists
        if (typeof triggerFinalAnalysis === "function") {
            triggerFinalAnalysis();
            console.log("triggerFinalAnalysis() called");
        } else {
            console.log("triggerFinalAnalysis function not available (may not be needed)");
        }
        
        // 5. Optionally scroll to results
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});
