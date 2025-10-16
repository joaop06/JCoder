import { User } from '../entities/user.entity';
import { RoleEnum } from '../../@common/enums/role.enum';

export const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedPasswordExample',
    role: RoleEnum.User,
    applications: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
};

export const mockAdminUser: User = {
    id: 2,
    email: 'admin@example.com',
    password: '$2b$10$hashedAdminPasswordExample',
    role: RoleEnum.Admin,
    applications: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
};

export const mockSoftDeletedUser: User = {
    id: 3,
    email: 'deleted@example.com',
    password: '$2b$10$hashedDeletedPasswordExample',
    role: RoleEnum.User,
    applications: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: new Date('2024-01-02T00:00:00Z'),
};

export const mockUsers: User[] = [
    mockUser,
    mockAdminUser,
    mockSoftDeletedUser,
];

export const mockUserRepository = {
    findOneBy: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    preload: jest.fn(),
    upsert: jest.fn(),
    insert: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
        transaction: jest.fn(),
    },
};

export const mockUserService = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
};

export const createMockUser = (overrides: Partial<User> = {}): User => ({
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedPasswordExample',
    role: RoleEnum.User,
    applications: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
});

export const createMockUsers = (count: number, overrides: Partial<User> = {}): User[] => {
    return Array.from({ length: count }, (_, index) =>
        createMockUser({
            id: index + 1,
            email: `user${index + 1}@example.com`,
            ...overrides,
        })
    );
};

export const mockUserData = {
    valid: {
        email: 'valid@example.com',
        password: 'validPassword123',
        role: RoleEnum.User,
    },
    invalid: {
        email: 'invalid-email',
        password: '',
        role: 'invalid-role' as any,
    },
    admin: {
        email: 'admin@example.com',
        password: 'adminPassword123',
        role: RoleEnum.Admin,
    },
    withApplications: {
        email: 'user-with-apps@example.com',
        password: 'password123',
        role: RoleEnum.User,
        applications: [
            { id: 1, name: 'App 1' },
            { id: 2, name: 'App 2' },
        ],
    },
};

export const mockUserQueries = {
    findById: (id: number) => ({ id }),
    findByEmail: (email: string) => ({ email }),
    findByRole: (role: RoleEnum) => ({ role }),
    findActive: () => ({ deletedAt: null as Date | null }),
    findDeleted: () => ({ deletedAt: { $ne: null } as any }),
};

export const mockUserResponses = {
    success: {
        user: mockUser,
        users: mockUsers,
        count: mockUsers.length,
    },
    notFound: {
        user: null as User | null,
        users: [] as User[],
        count: 0,
    },
    error: {
        database: new Error('Database connection failed'),
        validation: new Error('Validation failed'),
        unauthorized: new Error('Unauthorized access'),
    },
};

export const resetUserMocks = () => {
    Object.values(mockUserRepository).forEach(mock => {
        if (typeof mock === 'function' && 'mockClear' in mock) {
            mock.mockClear();
        }
    });

    Object.values(mockUserService).forEach(mock => {
        if (typeof mock === 'function' && 'mockClear' in mock) {
            mock.mockClear();
        }
    });
};

export const setupUserRepositoryMocks = () => {
    mockUserRepository.findOneBy.mockImplementation(({ id, email }) => {
        if (id) {
            return Promise.resolve(mockUsers.find(user => user.id === id) || null);
        }
        if (email) {
            return Promise.resolve(mockUsers.find(user => user.email === email) || null);
        }
        return Promise.resolve(null);
    });

    mockUserRepository.find.mockResolvedValue(mockUsers);
    mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve({ ...user, id: user.id || Math.floor(Math.random() * 1000) })
    );
    mockUserRepository.count.mockResolvedValue(mockUsers.length);
    mockUserRepository.softDelete.mockResolvedValue({ affected: 1 });
    mockUserRepository.delete.mockResolvedValue({ affected: 1 });
};

export const setupUserServiceMocks = () => {
    mockUserService.findById.mockImplementation((id: number) => {
        const user = mockUsers.find(u => u.id === id);
        if (!user) {
            throw new Error('User not found');
        }
        return Promise.resolve(user);
    });

    mockUserService.findByEmail.mockImplementation((email: string) => {
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
            throw new Error('User not found');
        }
        return Promise.resolve(user);
    });

    mockUserService.findAll.mockResolvedValue(mockUsers);
    mockUserService.count.mockResolvedValue(mockUsers.length);
};
