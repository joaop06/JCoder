export interface UserComponentCertificate {
    userId: number;
    certificateName: string;
    registrationNumber?: string;
    verificationUrl?: string;
    issueDate: Date | string;
    issuedTo: string;
    profileImage?: string;
}

