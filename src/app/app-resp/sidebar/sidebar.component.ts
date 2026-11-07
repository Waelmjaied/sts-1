import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GestionService } from '../../gestion.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'] // <- fixed
    ,
    standalone: false
})
export class SidebarComponent implements OnInit {
  @Input() currentUser = localStorage.getItem('name') || null;
  @Input() roleUser = localStorage.getItem('role') || null;

  menuItems: MenuItem[] = [];

  constructor(private router: Router, private authService: GestionService) {}
  role : string | null = null

  ngOnInit() {
    const menu: MenuItem[] = [];
    this.role = this.authService.getRoleFromToken();
    // RH menu items
    const rhMenu: MenuItem[] = [
      { icon: 'fas fa-users', label: 'Utilisateurs', route: '/users' },
    ];

    // Admin menu
    const adminMenu: MenuItem[] = [
      { icon: 'fas fa-tower-broadcast text-white-900', label: 'Operateurs', route: '/operateurs' },
    ]

    //Chef projet Menu
    const chefProjetMenu: MenuItem[] = [
      { icon: 'fas fa-project-diagram text-white-900', label: 'Projets', route: '/projets' },
    ]

    // RESPONSABLE menu items
    const respMenu: MenuItem[] = [
      { icon: 'fas fa-route text-white-900', label: 'Tableau de bord', route: '/dashboard' },
    ];
    const agentOoredooMenu: MenuItem[] = [
        { icon: 'fas fa-chart-line text-white-900', label: 'Statistique', route: '/statistique' },
        { icon: 'fas fa-network-wired text-white-900', label: 'Abonnés FTTH', route: '/raccordements' },
      ];
    const respMenu2: MenuItem[] = [
      { icon: 'fas fa-network-wired text-white-900', label: 'Attachements', route: '/attachements' },
    ];
    //Magasinier Menu
    const magasinierMenu: MenuItem[] = [
      { icon: 'fas fa-box text-white-900', label: 'Articles', route: '/articles' },
    ];

    if (this.roleUser === 'CHEFPROJET') menu.push(...respMenu, ...agentOoredooMenu, ...respMenu2, ...chefProjetMenu, ...magasinierMenu, ...rhMenu);
    if (this.roleUser === 'RESPONSABLE') menu.push(...respMenu, ...agentOoredooMenu, ...respMenu2, ...magasinierMenu);
    if (this.roleUser === 'ADMIN') menu.push(...agentOoredooMenu, ...respMenu2, ...adminMenu, ...chefProjetMenu, ...rhMenu);
    if (this.roleUser === 'RH') menu.push(...rhMenu);
    if (this.roleUser === 'OOREDOO') menu.push(...agentOoredooMenu);

    this.menuItems = menu;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
