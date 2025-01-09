import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Department } from './department';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  constructor(private _HttpClient: HttpClient) {
    localStorage.setItem(
      "userToken",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjRlMGY2NzlmLTdiMDEtNDdjYy04MmI0LWZjYjU2Mjk5ZmYwYiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6IlJhaG1vQHJ0YS5hZSIsImV4cCI6MTczODE2NzAyOSwiaXNzIjoiaHR0cDovL3Byb2plY3QuY29tIiwiYXVkIjoiaHR0cDovL3Byb2plY3QuY29tIn0.gdETY5wRk2fCddK403OI4J97KFoR7G7Ynb5vAQphpMY"
    );
  }
  getdepartmentData(): Observable<Department[]> {
    return this._HttpClient.get<Department[]>(
      `${environment.baseUrl}/department`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      }
    );
  }
  adddepartmentData(department: Department): Observable<Department> {
    return this._HttpClient.post<Department>(
      `${environment.baseUrl}/department`,
      department,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      }
    );
  }
  showRow(keyId: string): Observable<Department> {
    return this._HttpClient.get<Department>(
      `${environment.baseUrl}/department/${keyId}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      }
    );
  }
  deletedepartmentData(keyId: string): Observable<void> {
    return this._HttpClient.delete<void>(
      `${environment.baseUrl}/department/${keyId}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      }
    );
  }
  updatedepartmentData(
    department: Department,
    keyId: string
  ): Observable<any> {
    return this._HttpClient.put(
      `${environment.baseUrl}/department/${keyId}`,
      department,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      }
    );
  }
}
