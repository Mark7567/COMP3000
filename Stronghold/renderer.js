const $ = (id) => document.getElementById(id);
const urlInput = $('url');

$('back_button').addEventListener('click', () => window.stronghold.back());
$('forward_button').addEventListener('click', () => window.stronghold.forward());
$('reload_button').addEventListener('click', () => window.stronghold.reload());
$('home_button').addEventListener('click', () => window.stronghold.home());
$('dashboard_button').addEventListener('click', () => window.stronghold.dashboard());

$('navigation').addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = urlInput.value.trim();
    const res = await window.stronghold.goto(val); 

    if(!val) {
        return;
    }

    if(!res?.okay) {
        alert(res.error || 'Navigation Failure');
    }
});

window.stronghold.onLocationChange((url) => {
    urlInput.value = url || '';
});

$('new_tab_button').addEventListener('click', () => window.stronghold.newTab());

function showTabs(tabNumber) {
    const tabHolder = document.getElementById('tabs_holder');
    tabHolder.innerHTML = '';

    for(let i = 0; i < tabNumber; i++) {
        const tab = document.createElement('div');
        
        tab.dataset.tabNumber = i;
        tab.addEventListener('click', (e) => {
            const tabID = Number(e.currentTarget.dataset.tabNumber);
            window.stronghold.switchTab(tabID);
        });
        
        
        tabHolder.appendChild(tab);
    }
}

window.addEventListener('updateTabs', (e) => {
    const {tabNumber, activeTab} = e.detail;
    showTabs(tabNumber, activeTab);
})