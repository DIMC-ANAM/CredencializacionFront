import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CredencializacionComponent } from './credencializacion.component';

describe('CredencializacionComponent', () => {
  let component: CredencializacionComponent;
  let fixture: ComponentFixture<CredencializacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CredencializacionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CredencializacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
