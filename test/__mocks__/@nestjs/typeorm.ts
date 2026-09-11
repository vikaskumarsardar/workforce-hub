import { Inject } from '@nestjs/common';

export function getRepositoryToken(entity: any) {
  return `${typeof entity === 'string' ? entity : entity.name}Repository`;
}

export function InjectRepository(entity: any) {
  return Inject(getRepositoryToken(entity));
}

export class TypeOrmModule {
  static forRootAsync() {
    return { module: class {} };
  }
  static forFeature() {
    return { module: class {} };
  }
}
