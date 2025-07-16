### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### [1.3.1](https://github.com/flesler/parallel/compare/1.3.0...1.3.1)

- Release 1.3.0 [`2299c24`](https://github.com/flesler/parallel/commit/2299c24d8d172ca175e7cefaa652a391e3023d1c)

#### [1.3.0](https://github.com/flesler/parallel/compare/1.2.0...1.3.0)

- Add various new useful placeholders, that are not in the GNU version [`8d3515c`](https://github.com/flesler/parallel/commit/8d3515ca91b7d2f14eb3369c6c717003289aa3c7)
- Release 1.3.0 [`d7f3455`](https://github.com/flesler/parallel/commit/d7f3455da2567f00b2d15fa06604e4e751f56cf2)

#### [1.2.0](https://github.com/flesler/parallel/compare/1.1.1...1.2.0)

- Closes #1 [`#1`](https://github.com/flesler/parallel/issues/1)

#### [1.1.1](https://github.com/flesler/parallel/compare/1.0.10...1.1.1)

- WIP 1.0.11 [`d895428`](https://github.com/flesler/parallel/commit/d895428e187f49c472e6fdcafeb74596a1c6753d)
- Changed the workaround to handle stdin not being piped in [`2c64ee0`](https://github.com/flesler/parallel/commit/2c64ee0bbec45f8e39bbe882fa8ccbe9d3711983)
- Improved some cryptic variable names [`98644ca`](https://github.com/flesler/parallel/commit/98644ca552b7ceff486be5142103c0fc4f6eee7c)
- 1.1.1 ready for release [`c83b70d`](https://github.com/flesler/parallel/commit/c83b70de221b169796cdf44fd7751fe2ffcd10fd)

#### [1.0.10](https://github.com/flesler/parallel/compare/1.0.9...1.0.10)

- WIP 1.0.10 [`f3605b9`](https://github.com/flesler/parallel/commit/f3605b9e3d7f1dd07239c3f94f903e21e9acbe73)
- Each argument after a ::: is now a separate line [`3833d46`](https://github.com/flesler/parallel/commit/3833d46a6fbb903b2662f66e6930439f200d968e)

#### [1.0.9](https://github.com/flesler/parallel/compare/1.0.8...1.0.9)

- NPM doesn't accept 1.0.8.1, using 1.0.9 then [`0d2e5e6`](https://github.com/flesler/parallel/commit/0d2e5e6174390b24bc3d33c85bad569a038e1013)

#### [1.0.8](https://github.com/flesler/parallel/compare/1.0.7...1.0.8)

- Removed NPM badge, looks ugly [`60a3461`](https://github.com/flesler/parallel/commit/60a3461f0736d524caab986cbc258836290f59bc)
- Changed --trim help description [`e2e70b0`](https://github.com/flesler/parallel/commit/e2e70b08e675a39b5163eeb79610f293f7a1f505)
- Fixed markdown error on README [`4a98ad2`](https://github.com/flesler/parallel/commit/4a98ad2f66b6e1c5a1ad153423bea14a56abbbe0)
- `--jobs=0` is now supported for an unlimited amount of parallel jobs [`c0083f3`](https://github.com/flesler/parallel/commit/c0083f34d733d294e63f9885da7b5668ed4c0803)
- Alternative solution for input bug [`ec32d19`](https://github.com/flesler/parallel/commit/ec32d197ded48168b3b4384869db2dd5e1620d55)

#### [1.0.7](https://github.com/flesler/parallel/compare/1.0.6...1.0.7)

- Added and reordered ToDos [`c418f22`](https://github.com/flesler/parallel/commit/c418f22e42f6d73e79c33e81a8c176d7470a8899)
- Supporting more options formats and added alias for --dry-run [`4bc5693`](https://github.com/flesler/parallel/commit/4bc56938a6e128ec2fdde2ffd8af491f89c6f62f)

#### [1.0.6](https://github.com/flesler/parallel/compare/1.0.5...1.0.6)

- gitignore [`bd8910e`](https://github.com/flesler/parallel/commit/bd8910ec10d600cece8183ff5a22877dca102326)
- Added support for --dry-run option, resulting commands are printed to stdout within runnning. Incompatible with --pipe [`5efcff6`](https://github.com/flesler/parallel/commit/5efcff6f0a016173ac00efc87a34a43bbbd96526)

#### 1.0.5

- Initial commit [`ba74ecd`](https://github.com/flesler/parallel/commit/ba74ecd9200a637d2fc098ab9bfe7234a2141a4d)
- First version [`a866955`](https://github.com/flesler/parallel/commit/a866955338c95c11274a7d35a01062962fe918b5)
- Escaping semicolon [`ad3f182`](https://github.com/flesler/parallel/commit/ad3f182193eb365edecb0b9dcedef1738e04c065)
- Lots of changes, brought back to 1.0.0 to publish as parallel [`af5ef5e`](https://github.com/flesler/parallel/commit/af5ef5e21065b409fb6f5f07424a273c146ec9ac)
- Reworded 'replacement' as placeholder, is a more suitable name [`03ca045`](https://github.com/flesler/parallel/commit/03ca0455ed0b7d71f8af3cbd8e0627afa7bcf63c)
- Added support for --bg option, jobs are run detached and main process can exit [`73e22ed`](https://github.com/flesler/parallel/commit/73e22ed9d18df52165afd37547bef7f208677d6d)
- Added ToDos [`99a81b3`](https://github.com/flesler/parallel/commit/99a81b3717df0f40e0003386a75f6ed86a726fab)
- Implemented --delay [`5fb24d7`](https://github.com/flesler/parallel/commit/5fb24d7d14a83be8308df8ed86bce3c45b9b4c41)
- Added support for --timeout [`475677a`](https://github.com/flesler/parallel/commit/475677a5926ee140e1436c49709b62e7c20fbaef)
- Added npm run release for fancy automated releases with tags [`3f738d6`](https://github.com/flesler/parallel/commit/3f738d6ba7bc8b74cc117ccc788e6ef064bcf968)
- Added NPM badge [`e6a7a93`](https://github.com/flesler/parallel/commit/e6a7a930e65d55040f2543459b84d0252e7c276f)
- Description [`ba74b96`](https://github.com/flesler/parallel/commit/ba74b9670adcb24aa2989b7bf9ad58c400dde8d6)
- Description [`c5a9cdc`](https://github.com/flesler/parallel/commit/c5a9cdcf2b8942aed3a20d316e9dcba66d4760af)
- Implemented positional placeholders to split input line in columns [`0942218`](https://github.com/flesler/parallel/commit/09422183e27ba72992c4956ca5010581ada45022)
