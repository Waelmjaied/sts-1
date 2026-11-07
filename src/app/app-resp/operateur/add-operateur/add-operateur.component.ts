import {Component, EventEmitter, Output} from '@angular/core';
import {GestionService} from '../../../gestion.service';

@Component({
    selector: 'app-add-operateur',
    templateUrl: './add-operateur.component.html',
    styleUrl: './add-operateur.component.css',
    standalone: false
})
export class AddOperateurComponent {
  @Output() refresh = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  operateur: any = {
    nomOperateur: ''
  };

  constructor(private gest: GestionService) {}


  addOperateur() {
    if (!this.operateur.nomOperateur ) {
      console.error('Operateur name is required');
      return;
    }


    const payload = {
      ...this.operateur
    };

    this.gest.createOperateur(payload).subscribe({
      next: () => {
        this.refresh.emit();
        this.close.emit();
      },
      error: (err) => console.error('Error adding operateur:', err)
    });
  }
}
