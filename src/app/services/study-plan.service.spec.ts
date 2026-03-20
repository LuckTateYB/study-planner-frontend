import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StudyPlanService } from './study-plan.service';
import { PlanRequest, PlanResponse } from '../models/study-session';

describe('StudyPlanService', () => {
  let service: StudyPlanService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudyPlanService]
    });
    service = TestBed.inject(StudyPlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // verifica que no queden requests pendientes
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería llamar a POST /plan/generate y retornar el plan', () => {
    const mockRequest: PlanRequest = {
      userId: 1,
      courses: [{ name: 'Mathematics' }],
      exams: [{ course: 'Mathematics', date: '2026-06-10' }],
      hoursPerDay: 3,
      preferredStudyTime: 'EVENING'
    };

    const mockResponse: PlanResponse = {
      studyPlan: [
        {
          date: '2026-06-01',
          sessions: [
            { course: 'Mathematics', startTime: '18:00', duration: 1 }
          ]
        }
      ]
    };

    service.generatePlan(mockRequest).subscribe(res => {
      expect(res.studyPlan.length).toBe(1);
      expect(res.studyPlan[0].sessions[0].course).toBe('Mathematics');
    });

    const req = httpMock.expectOne('http://localhost:8080/plan/generate');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('debería emitir un error legible si el backend falla', () => {
    const mockRequest: PlanRequest = {      userId: 1,      courses: [{ name: 'Test' }],
      exams: [{ course: 'Test', date: '2026-06-10' }],
      hoursPerDay: 2,
      preferredStudyTime: 'MORNING'
    };

    service.generatePlan(mockRequest).subscribe({
      next: () => fail('Debería haber fallado'),
      error: (err: Error) => {
        expect(err.message).toContain('Error del servidor');
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/plan/generate');
    req.flush({ message: 'Internal error' }, { status: 500, statusText: 'Server Error' });
  });
});
