// MAIN TABS
document.querySelectorAll(".tab-button").forEach(btn => {

    btn.onclick = () => {

        document.querySelectorAll(".tab").forEach(tab => {
            tab.style.display = "none";
        });

        let tabId = btn.dataset.tab;
        let tab = document.getElementById(tabId);

        tab.style.display = "block";

        // AUTO SHOW FIRST SUBTAB
        let firstSubtab = tab.querySelector(".subtab");
        if (firstSubtab) {

            tab.querySelectorAll(".subtab").forEach(sub => {
                sub.style.display = "none";
            });

            firstSubtab.style.display = "block";
        }
    };

});
// SUBTABS
document.querySelectorAll(".subtab-button").forEach(btn => {

    btn.onclick = () => {
        let parent = btn.closest(".tab");
        parent.querySelectorAll(".subtab").forEach(sub => {
            sub.style.display = "none";
        }); 
        let sub = btn.dataset.subtab;
        parent.querySelector("#" + sub).style.display = "block";
        parent.querySelectorAll(".subtab-button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    };
});