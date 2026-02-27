// ====================================================
// COMPARTILHAR USUÁRIOS ENTRE ENDPOINTS
// ====================================================
// users.ts

export interface User {
    email: string;
    password: string; // Em produção, hash!
    username?: string;
    phone?: string;
    createdAt: Date;
}

// Array global de usuários
declare global {
    var users: User[];
}

// Inicializar se não existir
if (!global.users) {
    global.users = [];
}

// Funções auxiliares
export function findUserByEmail(email: string): User | undefined {
    return global.users.find(u => u.email === email);
}

export function addUser(user: User): void {
    global.users.push(user);
    console.log(`✅ Usuário adicionado. Total: ${global.users.length}`);
}

export function getAllUsers(): User[] {
    return global.users;
}

export function userExists(email: string): boolean {
    return global.users.some(u => u.email === email);
}
