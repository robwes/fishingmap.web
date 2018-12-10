import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesListItemComponent } from './species-list-item.component';

describe('SpeciesListItemComponent', () => {
  let component: SpeciesListItemComponent;
  let fixture: ComponentFixture<SpeciesListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeciesListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
