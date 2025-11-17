frappe.ready(() => {
  // જૂની Help dropdown છુપાવો
  const helpDropdown = document.querySelector('.dropdown-help');
  if (helpDropdown) helpDropdown.style.display = 'none';

  // નવી Help Dropdown બનાવો
  const newHelpHTML = `
    <li class="dropdown dropdown-help">
      <a class="dropdown-toggle" data-toggle="dropdown" href="#" title="Help">
        <i class="fa fa-question-circle"></i>
      </a>
      <ul class="dropdown-menu dropdown-menu-right" role="menu">
        <li><a href="https://docs.galaxyerpsoftware.com/" target="_blank"><i class="fa fa-book"></i> Documentation</a></li>
        <li><a href="https://github.com/GalaxyERPSoftware/GalaxyNext" target="_blank"><i class="fa fa-bug"></i> Report an Issue</a></li>
        <li><a href="#" onclick="frappe.ui.misc.about(); return false;"><i class="fa fa-info-circle"></i> About</a></li>
        <li><a href="#" onclick="frappe.ui.keys.show(); return false;"><i class="fa fa-keyboard-o"></i> Keyboard Shortcuts</a></li>

        <!-- Commented Out -->
        <!-- <li><a href="https://discuss.frappe.io">User Forum</a></li> -->
        <!-- <li><a href="https://frappe.school">Frappe School</a></li> -->
        <!-- <li><a href="https://frappe.io/support">Frappe Support</a></li> -->
      </ul>
    </li>
  `;

  // Navbar માં inject કરો
  const userArea = document.querySelector('.navbar-right');
  if (userArea) userArea.insertAdjacentHTML('beforeend', newHelpHTML);
});
