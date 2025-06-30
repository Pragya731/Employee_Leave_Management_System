export interface EmployeeSummary {
  totalEmployees: number;
  totalLeaveRequests: number;
}

  
  export interface PendingLeave {
    _id: string;
    status: string;
    startDate: string;
    endDate: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
      departmentId?: {
        name: string;
      };
    };
    leaveTypeId?: {
      name: string;
    };
  }
  
  export interface RecentLeave {
    _id: string;
    startDate: string;
    endDate: string;
    userId: {
      firstName: string;
      lastName: string;
    };
    leaveTypeId: {
      name: string;
    };
  }
  
  