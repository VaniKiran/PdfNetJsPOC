import { TestBed, inject } from '@angular/core/testing';

import { WebviewerService } from './webviewer.service';

describe('WebviewerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebviewerService]
    });
  });

  it('should ...', inject([WebviewerService], (service: WebviewerService) => {
    expect(service).toBeTruthy();
  }));
});
