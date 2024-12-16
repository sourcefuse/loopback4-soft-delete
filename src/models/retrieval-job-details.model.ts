import {Entity, model, property} from '@loopback/repository';
import {JobStatus} from '../types';

@model({
  name: 'retrieval_job_details',
  settings: {
    strict: false,
  },
})
export class RetrievalJobDetails extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(JobStatus),
    },
  })
  status: JobStatus;

  @property({
    name: 'filter',
    type: 'object',
  })
  filter: Object;

  @property({
    name: 'entity',
    type: 'string',
  })
  entity: string; //Entity Name

  @property({
    type: 'string',
  })
  result: string;

  constructor(data?: Partial<RetrievalJobDetails>) {
    super(data);
  }
}
