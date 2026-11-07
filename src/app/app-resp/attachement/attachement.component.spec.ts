import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachementComponent } from './attachement.component';

describe('AttachementComponent', () => {
  let component: AttachementComponent;
  let fixture: ComponentFixture<AttachementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttachementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
