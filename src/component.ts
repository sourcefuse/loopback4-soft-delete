import {Component, ProviderMap} from '@loopback/core';
export class SoftDeleteComponent implements Component {
  providers?: ProviderMap = {};

  constructor() {
    // Initialize the providers property in the constructor
    this.providers = {};
  }
}
