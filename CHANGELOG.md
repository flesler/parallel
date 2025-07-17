### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### [v2.3.0](https://github.com/flesler/parallel/compare/v2.2.1...v2.3.0)

- Improve placeholder handling and README examples [`fa76f36`](https://github.com/flesler/parallel/commit/fa76f367f61d3666737640f2ae3250590969f9aa)
- Add {+..} and {+...} placeholders for GNU --plus compatibility [`1ddc917`](https://github.com/flesler/parallel/commit/1ddc91777b5d8be9798a7d37d91d3c7f7d73d972)
- Implemet a {##} placeholder, require some refactoring for cleaner buffering support [`775861e`](https://github.com/flesler/parallel/commit/775861e8de2287e435bd43491d8fd2f9940717e3)
- Simplify the default --jobs handling for --help [`840ba62`](https://github.com/flesler/parallel/commit/840ba624438a92b3dddcafe1ba7c1b18a9650890)
- Improve option combination validation and --block implies --pipe [`e7a4881`](https://github.com/flesler/parallel/commit/e7a4881c7e48007d1dc98720ce87bd6bbcb6c16f)

#### [v2.2.1](https://github.com/flesler/parallel/compare/v2.2.0...v2.2.1)

- Improve the readme.js code [`74cb1a4`](https://github.com/flesler/parallel/commit/74cb1a46e8123c59cdc76a6818d64502545db6df)
- Reorganize and improve 'Differences with GNU parallel' section for accuracy and clarity [`8e78d9a`](https://github.com/flesler/parallel/commit/8e78d9ab3d2930b29116cc9ad9103ed30563daaf)
- Split README examples into individual bash blocks for easier copy/paste [`4bab99d`](https://github.com/flesler/parallel/commit/4bab99d32bd67dbe9ffd1e4e57278157277f4a3f)

#### [v2.2.0](https://github.com/flesler/parallel/compare/v2.1.0...v2.2.0)

- Add the package name and version to the --help [`592ac0d`](https://github.com/flesler/parallel/commit/592ac0d6f9861511de60c4fbe0b87f3c61bf8543)
- Move placeholders that are GNU-compliant to the right section [`6307b04`](https://github.com/flesler/parallel/commit/6307b049c850ed0725d08c0009c1977bcd3e5874)
- Fix help not getting the options in one case [`3db9936`](https://github.com/flesler/parallel/commit/3db9936faee86e43ed93ba4829f2f01837ea4f52)
- The placeholder documentation in --help and README.md are now programmatically generated [`8d5f95c`](https://github.com/flesler/parallel/commit/8d5f95cc81e29c4edafd5f8de6f972254d39a038)
- Add {+/} placeholder to count forward slashes (GNU parallel --plus compatibility) [`789d289`](https://github.com/flesler/parallel/commit/789d2897d985c10ff2c88023d19926623ab13455)
- Add {+.} placeholder to count dots (GNU parallel --plus compatibility) [`f49b58f`](https://github.com/flesler/parallel/commit/f49b58fc9a92c00f31068fee629784f631d42a96)
- Add {trim} placeholder to remove leading/trailing whitespace [`cb4008d`](https://github.com/flesler/parallel/commit/cb4008d40e378267ae5fe9741518b46ad0234123)

#### [v2.1.0](https://github.com/flesler/parallel/compare/v2.0.0...v2.1.0)

- Add professional badges to README for npm, downloads, license, and GitHub stats [`6e495ee`](https://github.com/flesler/parallel/commit/6e495ee62398731fd624a41d26547237e4e0ae33)
- Refactor README generation in help.js and update README with no leading spaces [`df5bf58`](https://github.com/flesler/parallel/commit/df5bf5825e65e738cf42f16d69db9b6236f23186)
- Show help when parallel is run with no arguments and no piped input [`2d00685`](https://github.com/flesler/parallel/commit/2d00685fcc05dbc19043a5366a6ea25722343280)

### [v2.0.0](https://github.com/flesler/parallel/compare/1.3.1...v2.0.0)

- Add placeholders for double extension handling [`29b4481`](https://github.com/flesler/parallel/commit/29b44819835ead96f3677f91229e5bbc5fcf0e69)
- Fix GNU parallel compatibility for {..} placeholder [`bb8a80f`](https://github.com/flesler/parallel/commit/bb8a80fd272976ed56ca75b24f926f958f2bdefe)
- Add {len} placeholder for input line character length [`fa8919c`](https://github.com/flesler/parallel/commit/fa8919c99c8319c7d6141117443e79c8a81ceed0)
- Add {wc} placeholder for input line word count [`9d67904`](https://github.com/flesler/parallel/commit/9d67904d65e8c364fd3b2709ef3235cdaf846fc9)
- Add --tag option to prefix output lines with input arguments [`0b8bedd`](https://github.com/flesler/parallel/commit/0b8bedd0f4a08e8efa1e7f0af424521de533c978)
- Use fn.length instead of param property for argument parsing [`5013a79`](https://github.com/flesler/parallel/commit/5013a798f8a01d898d1868abd47aa4fcefbdf736)
- Extract semantic parameter names from function signatures for help output [`b5eba0e`](https://github.com/flesler/parallel/commit/b5eba0e4424f06f87f26535e2cfdf5ceed39702f)
- Implement --joblog with proper stream closure when jobs finish [`8172486`](https://github.com/flesler/parallel/commit/8172486a3dfd819ce45c5b7f25386b80c254a9aa)
- Fix critical bug in ::: syntax causing process to hang [`994f6bb`](https://github.com/flesler/parallel/commit/994f6bb790ff2639f21a6f855dfa040df6051ac3)
- Add compare.sh script to test against GNU parallel [`7ec772a`](https://github.com/flesler/parallel/commit/7ec772af16ff5fb3f4149951aba1fda3bd747f32)
- Fix verbose logging in pipe mode to avoid redundant command output [`f212416`](https://github.com/flesler/parallel/commit/f212416ff2d4b109e324e7995b2a0aa89264826c)
- Convert all leading tabs to 2 spaces for consistent indentation [`04e708d`](https://github.com/flesler/parallel/commit/04e708de31373b1a71d2522504824443433011d6)
- Remove outdated TODOs and refactor dry-run to eliminate code duplication [`10316b5`](https://github.com/flesler/parallel/commit/10316b5975bab500071c8fd78450e04be7ae5d35)
- Implement --shuf option and update documentation [`8c8df24`](https://github.com/flesler/parallel/commit/8c8df247fccc5fb183e26d28040f037b45fcfc64)
- Create an update-readme.js script that auto-updates the README.md based on --help [`01996f8`](https://github.com/flesler/parallel/commit/01996f85ca341d8a0175dc6bad587920a3fefd1f)
- Add --quote-all alias for --quote option [`ad50d49`](https://github.com/flesler/parallel/commit/ad50d49ed6a65ac13fea5bd767edba7e0d7d0238)
- Clean up completed TODO comments and simplify code [`07b4699`](https://github.com/flesler/parallel/commit/07b469926e4fe2a4326a6989809286daab6aee9e)
- Remove all trailing semicolons for cleaner code style [`ae10ee4`](https://github.com/flesler/parallel/commit/ae10ee4eee53c782a89be2849ccbc4b2cc926436)
- Refactor opts.js to use single module.exports object [`27c1adc`](https://github.com/flesler/parallel/commit/27c1adcd49669f12eefc442d00c96a6a883f95f0)
- Replace all var declarations with let/const for ES6 compliance [`889d86a`](https://github.com/flesler/parallel/commit/889d86a808066656078675b02b2d57644bc27842)
- Modernize code with template literals and arrow functions [`00c99ab`](https://github.com/flesler/parallel/commit/00c99ab13c5fd72f5695648d81a9687ed5f2e07c)
- Standardize opts properties to match camelCase CLI options and add GNU parallel compatibility features [`254c166`](https://github.com/flesler/parallel/commit/254c16642a9876cd903ff9b02b2199175d8b3ba1)
- Update README with new options and improved help format [`4f77e0e`](https://github.com/flesler/parallel/commit/4f77e0ee330b18eac867d830b160dad2ade7dba6)
- Add :::: file syntax support for reading arguments from files [`8d116b2`](https://github.com/flesler/parallel/commit/8d116b21a66c6022c3c96ef2440a198e48f26df8)
- Add -t/--print-commands flag for GNU parallel compatibility [`d810936`](https://github.com/flesler/parallel/commit/d810936cb97da4201f418167958063f34729c49d)
- Add --block option for size-based input splitting in pipe mode [`83e99bc`](https://github.com/flesler/parallel/commit/83e99bc2f4dc40f07d39eee45226536a88847394)
- Update README with new GNU parallel compatibility features [`c8d40b6`](https://github.com/flesler/parallel/commit/c8d40b6c4cdcea46666ac661c107c326d3ad693e)
- Change default jobs from hardcoded 20 to CPU count with CPUs display in help [`3afc8a5`](https://github.com/flesler/parallel/commit/3afc8a554c212b7f051dd8d111ee5515fb06e4e3)
- Polish examples to showcase new features and ensure all work correctly [`da4b644`](https://github.com/flesler/parallel/commit/da4b644bc1ff590d0ebc5b03fe61f87dae10ca46)
- Add .nvmrc [`9eb7796`](https://github.com/flesler/parallel/commit/9eb7796f5b557a707b49c94a4c1e37ae10c9bafb)
- Rename update-readme.js to readme.js [`23ebd67`](https://github.com/flesler/parallel/commit/23ebd677ebf5091eb7ae0a833381ce3cd73ba6b2)
- Add a new changelog.js script [`fff7d5a`](https://github.com/flesler/parallel/commit/fff7d5aecd8cd00fd991ff0abdd411a3988a1b6a)
- Add a new release.js script [`d341e10`](https://github.com/flesler/parallel/commit/d341e10c892bf21bd2f38fd7c0b4b9508394a55d)

#### [1.3.1](https://github.com/flesler/parallel/compare/1.3.0...1.3.1)

#### [1.3.0](https://github.com/flesler/parallel/compare/1.2.0...1.3.0)

- Add various new useful placeholders, that are not in the GNU version [`8d3515c`](https://github.com/flesler/parallel/commit/8d3515ca91b7d2f14eb3369c6c717003289aa3c7)

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
