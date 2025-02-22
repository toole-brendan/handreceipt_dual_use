// Simple service to store and retrieve the selected version
export class AuthService {
  static setVersion(version: 'civilian' | 'defense'): void {
    localStorage.setItem('selectedVersion', version);
  }

  static getVersion(): 'civilian' | 'defense' {
    return (localStorage.getItem('selectedVersion') as 'civilian' | 'defense') || 'civilian';
  }
}
