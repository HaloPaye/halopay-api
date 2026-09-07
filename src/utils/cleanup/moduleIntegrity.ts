export interface ModuleDescriptor {
  name: string;
  exportedSymbols: string[];
  dependencyCount: number;
}

export class ModuleIntegrityAuditor {
  private registry: Map<string, ModuleDescriptor> = new Map();

  public registerModule(name: string, exportedSymbols: string[], dependencyCount: number = 0): void {
    this.registry.set(name, {
      name,
      exportedSymbols: [...exportedSymbols].sort(),
      dependencyCount,
    });
  }

  public getModule(name: string): ModuleDescriptor | undefined {
    return this.registry.get(name);
  }

  public detectUnusedExports(activeSymbols: string[], moduleName: string): string[] {
    const mod = this.registry.get(moduleName);
    if (!mod) return [];
    const activeSet = new Set(activeSymbols);
    return mod.exportedSymbols.filter((sym) => !activeSet.has(sym));
  }

  public getRegisteredModuleCount(): number {
    return this.registry.size;
  }
}
