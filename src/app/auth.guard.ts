import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GestionService } from './gestion.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: GestionService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles: string[] = route.data['roles'] || [];
    const role = this.authService.getRoleFromToken();

    if (allowedRoles.includes(role ?? '')) {
      return true;
    }
    this.router.navigate(['/DeniedAccess']);
    return false;
  }
}
