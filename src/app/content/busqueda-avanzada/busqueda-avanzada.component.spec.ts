import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaAvanzadaComponent } from './busqueda-avanzada.component';

describe('BusquedaAvanzadaComponent', () => {
  let component: BusquedaAvanzadaComponent;
  let fixture: ComponentFixture<BusquedaAvanzadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusquedaAvanzadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaAvanzadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
