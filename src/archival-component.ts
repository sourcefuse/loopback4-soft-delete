import {
  Binding,
  Component,
  ContextTags,
  ControllerClass,
  CoreBindings,
  ProviderMap,
  ServiceOrProviderClass,
  inject,
  injectable,
} from '@loopback/core';
import {Class, Repository} from '@loopback/repository';
import {Model, RestApplication} from '@loopback/rest';
import {ArchivalComponentBindings} from './keys';
import {
  ArchivalMappingRepository,
  RetrievalJobDetailsRepository,
} from './repositories';
import {ProcessRetrievedDataProvider} from './providers';
import {
  BuildWhereConditionService,
  ImportArchivedDataService,
} from './services';
import {ArchiveMapping, RetrievalJobDetails} from './models';

// Configure the binding for ArchivalComponent
@injectable({tags: {[ContextTags.KEY]: ArchivalComponentBindings.COMPONENT}})
export class ArchivalComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: RestApplication,
  ) {
    this.providers = {};

    this.providers[ArchivalComponentBindings.PROCESS_RETRIEVED_DATA.key] =
      ProcessRetrievedDataProvider;

    this.application
      .bind('services.BuildWhereConditionService')
      .toClass(BuildWhereConditionService);
    this.application
      .bind('services.ImportArchivedDataService')
      .toClass(ImportArchivedDataService);

    this.repositories = [
      ArchivalMappingRepository,
      RetrievalJobDetailsRepository,
    ];

    this.models = [ArchiveMapping, RetrievalJobDetails];
  }
  providers?: ProviderMap = {};

  bindings?: Binding[] = [];

  services?: ServiceOrProviderClass[];

  /**
   * An optional list of Repository classes to bind for dependency injection
   * via `app.repository()` API.
   */
  repositories?: Class<Repository<Model>>[];

  /**
   * An optional list of Model classes to bind for dependency injection
   * via `app.model()` API.
   */
  models?: Class<Model>[];

  /**
   * An array of controller classes
   */
  controllers?: ControllerClass[];
}
