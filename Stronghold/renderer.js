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