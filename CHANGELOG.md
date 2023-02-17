## Release [v7.1.2](https://github.com/sourcefuse/loopback4-soft-delete/compare/v7.1.1..v7.1.2) February 17, 2023
Welcome to the February 17, 2023 release of loopback4-soft-delete. There are many updates in this version that we hope you will like, the key highlights include:

  - [Package Update - loopback4-soft-delete](https://github.com/sourcefuse/loopback4-soft-delete/issues/125) :- [remove all current vulnerability of loopback4-soft-delete ](https://github.com/sourcefuse/loopback4-soft-delete/commit/903404af4803042081bff031063d2924544e428e) was commited on February 17, 2023 by [Sunny Tyagi](mailto:107617248+Tyagi-Sunny@users.noreply.github.com)
    
      - * fix(chore): remove all current vulnerability
      
      -  remove all current vulnerability
      
      -  GH-125
      
      - * chore(deps): loopback version update
      
      -  loopback version update
      
      -  GH-125
      
  
  - [Correction to the changelog format](https://github.com/sourcefuse/loopback4-soft-delete/issues/123) :- [fix(chore): corrected the issue number ](https://github.com/sourcefuse/loopback4-soft-delete/commit/2425a474c2c3f174a5f52dbb89ee328afedeaedf) was commited on February 15, 2023 by [yeshamavani](mailto:83634146+yeshamavani@users.noreply.github.com)
    
      - now will show correct issue description as well
      
      -  GH-123
      
  
Clink on the above links to understand the changes in detail.
  ___

## Release [v7.1.1](https://github.com/sourcefuse/loopback4-soft-delete/compare/v7.1.0..v7.1.1) February 14, 2023
Welcome to the February 14, 2023 release of loopback4-soft-delete. There are many updates in this version that we hope you will like, the key highlights include:

  - [](https://github.com/sourcefuse/loopback4-soft-delete/issues/-117) :- [fix(repository): added checks for fields passed as an array in case of findbyid ](https://github.com/sourcefuse/loopback4-soft-delete/commit/2a66e5937019c604422fcac399cdd491650ce102) was commited on February 14, 2023 by [Prerna Gupta](mailto:prerna.gupta@sourcefuse.com)
    
      - added checks for fields passed as an array in function findById.
      
      -  GH-117
      
  
Clink on the above links to understand the changes in detail.
  ___

## Release [v7.1.0](https://github.com/sourcefuse/loopback4-soft-delete/compare/v7.0.2..v7.1.0) January 11, 2023
Welcome to the January 11, 2023 release of loopback4-soft-delete. There are many updates in this version that we hope you will like, the key highlights include:

  - [](https://github.com/sourcefuse/loopback4-soft-delete/issues/-115) :- [feat(chore): generate detailed and informative changelog ](https://github.com/sourcefuse/loopback4-soft-delete/commit/0c7805771fbf39ca827f42a74a831c8ec6e4c764) was commited on January 11, 2023 by [yeshamavani](mailto:83634146+yeshamavani@users.noreply.github.com)
    
      - Using Customizable npm package to generate changelog
      
      -  GH-115
      
  
  - [](https://github.com/sourcefuse/loopback4-soft-delete/issues/-112) :- [chore(deps): loopback version update ](https://github.com/sourcefuse/loopback4-soft-delete/commit/34f26d147ef8ae6d510e6f2e1b47277ab8bec10f) was commited on January 11, 2023 by [Surbhi Sharma](mailto:98279679+Surbhi-sharma1@users.noreply.github.com)
    
      - updated loopback datasource juggler version to latest
      
      -  GH-112
      
  
  - [](https://github.com/sourcefuse/loopback4-soft-delete/issues/-110) :- [chore(deps): loopback version updates ](https://github.com/sourcefuse/loopback4-soft-delete/commit/1a6b57cf7bad0993bb05a642ce2fbc341750daa5) was commited on January 11, 2023 by [Surbhi Sharma](mailto:98279679+Surbhi-sharma1@users.noreply.github.com)
    
      - Updated version of the lb4 dependencies to the latest
      
      -  GH-110
      
  
Clink on the above links to understand the changes in detail.
  ___

## [7.0.2](https://github.com/sourcefuse/loopback4-soft-delete/compare/v7.0.1...v7.0.2) (2022-12-05)

## [7.0.1](https://github.com/sourcefuse/loopback4-soft-delete/compare/v7.0.0...v7.0.1) (2022-12-05)

# [7.0.0](https://github.com/sourcefuse/loopback4-soft-delete/compare/v6.0.1...v7.0.0) (2022-11-16)


### Features

* **repository:** add new method to provide user identifier for deletedbyid ([aaeb150](https://github.com/sourcefuse/loopback4-soft-delete/commit/aaeb15023056b61c7048311f40ab254ab261ad6b)), closes [#0](https://github.com/sourcefuse/loopback4-soft-delete/issues/0)


### BREAKING CHANGES

* **repository:** change approach for custom identifier for deletedbyid

## [6.0.1](https://github.com/sourcefuse/loopback4-soft-delete/compare/v6.0.0...v6.0.1) (2022-11-11)


### Bug Fixes

* **repository:** type mismatch for Iauthuser ([e0c5464](https://github.com/sourcefuse/loopback4-soft-delete/commit/e0c54640f3ef2c1fad119afa9ae8f42e92c1048d)), closes [#0](https://github.com/sourcefuse/loopback4-soft-delete/issues/0)

# [6.0.0](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.3.5...v6.0.0) (2022-11-07)


### Features

* **repository:** allow deletedBy id to be configurable ([#100](https://github.com/sourcefuse/loopback4-soft-delete/issues/100)) ([1be1dc4](https://github.com/sourcefuse/loopback4-soft-delete/commit/1be1dc4245491086633d90eee9df930a45ea9bbd)), closes [#99](https://github.com/sourcefuse/loopback4-soft-delete/issues/99)
* **repository:** allow deletedBy id to be configurable using class protected property ([28de1cd](https://github.com/sourcefuse/loopback4-soft-delete/commit/28de1cd0f33d5f159bf25fb93b96c943a0b877d9)), closes [#99](https://github.com/sourcefuse/loopback4-soft-delete/issues/99)


### BREAKING CHANGES

* **repository:** change approach of deletedById key provider
* **repository:** remove dependency of loopback4-authentication

## [5.3.5](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.3.4...v5.3.5) (2022-10-31)

## [5.3.4](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.3.3...v5.3.4) (2022-10-14)

## [5.3.3](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.3.2...v5.3.3) (2022-09-20)


### Bug Fixes

* **repository:** fixed object assignment for filters ([#93](https://github.com/sourcefuse/loopback4-soft-delete/issues/93)) ([740da07](https://github.com/sourcefuse/loopback4-soft-delete/commit/740da07a509687e09f95e44af579fb895cf43796)), closes [#91](https://github.com/sourcefuse/loopback4-soft-delete/issues/91)

## [5.3.2](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.3.1...v5.3.2) (2022-09-19)


### Bug Fixes

* **repository:** add deleted property in fields filter ([#92](https://github.com/sourcefuse/loopback4-soft-delete/issues/92)) ([142179c](https://github.com/sourcefuse/loopback4-soft-delete/commit/142179cff96122388019945845a792a6898d614e)), closes [#91](https://github.com/sourcefuse/loopback4-soft-delete/issues/91)

## [5.3.1](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.3.0...v5.3.1) (2022-09-09)

# [5.3.0](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.2.1...v5.3.0) (2022-09-05)


### Features

* **repository:** remove multiple db calls for find by id ([#88](https://github.com/sourcefuse/loopback4-soft-delete/issues/88)) ([bbc9803](https://github.com/sourcefuse/loopback4-soft-delete/commit/bbc9803d90e6768f72e16eb24adee0a859890f25)), closes [#87](https://github.com/sourcefuse/loopback4-soft-delete/issues/87)

## [5.2.1](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.2.0...v5.2.1) (2022-07-28)

# [5.2.0](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.1.1...v5.2.0) (2022-07-21)


### Bug Fixes

* **repository): fix(repository:** fixed entitytoremove=null with mongodb ([#48](https://github.com/sourcefuse/loopback4-soft-delete/issues/48)) ([277142d](https://github.com/sourcefuse/loopback4-soft-delete/commit/277142d65e476ee1d3db0559dffc61e772e34ad9))


### Features

* **entity:** add mixin for SoftDeleteEntity and  DefaultCrudRepository ([#80](https://github.com/sourcefuse/loopback4-soft-delete/issues/80)) ([4cf6b9c](https://github.com/sourcefuse/loopback4-soft-delete/commit/4cf6b9c6254d508f6bbf564815b9cad6dc8c522f))

## [5.1.1](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.1.0...v5.1.1) (2022-06-21)

# [5.1.0](https://github.com/sourcefuse/loopback4-soft-delete/compare/v5.0.4...v5.1.0) (2022-05-25)


### Bug Fixes

* **deps:** remove vulnerabilities ([#74](https://github.com/sourcefuse/loopback4-soft-delete/issues/74)) ([d65bdfb](https://github.com/sourcefuse/loopback4-soft-delete/commit/d65bdfb1f807bc8b386cf2801aadf3e9da9b3f28)), closes [#73](https://github.com/sourcefuse/loopback4-soft-delete/issues/73)


### Features

* **ci-cd:** semantic release ([#76](https://github.com/sourcefuse/loopback4-soft-delete/issues/76)) ([9f6cb76](https://github.com/sourcefuse/loopback4-soft-delete/commit/9f6cb7684ae8fc56ff562841d7b20c621e3afe3b)), closes [#57](https://github.com/sourcefuse/loopback4-soft-delete/issues/57) [#57](https://github.com/sourcefuse/loopback4-soft-delete/issues/57)