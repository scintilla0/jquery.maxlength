# jquery.maxlength.js

A plugin for dynamic decimal max length auto-configuration.

CDN URL:
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.maxlength@latest/jquery.maxlength.js`

CDN URL(min.js):
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.maxlength@latest/jquery.maxlength.min.js`

### [Demo](https://scintilla0.github.io/jquery.maxlength/)

### Change log

#### 1.7.7 (2025-01-14)
*	[data-sum]... event now can work properly with no [data-max-length].
*	[data-sum]... event now can work properly on non-input elements.
*	[data-sum]... event now can work properly when elements are appended after document is ready.
*	[data-sum]... event now can be chain-triggered.
*	Add [data-percent].

#### 1.7.6 (2025-01-02)
*	Remove unused variables and functions.

#### 1.7.5 (2024-10-11)
*	$.NumberUtil.setValue() cannot trigger jQuery change event.

#### 1.7.4 (2024-07-31)
*	Add $.NumberUtil.areSameNumber().
*	Add [data-product], [data-difference], [data-quotient].
*	[data-sum] causing permanent cycle triggering event fixed.
*	[data-sum] event now automatically round and crop out the integer part that exceed the length limit.
*	Minor modification of variable names.

#### 1.7.3 (2024-06-23)
*	Use ES6 template strings.
*	Minor optimization.

#### 1.7.2 (2024-02-19)
*	Minor optimization.

#### 1.7.1 (2024-02-13)
*	Maintain cursor position when focusing on an input element and then starting to select its characters in a single mouse click action.

#### 1.7.0 (2024-02-09)
*	Major optimization, initialization execution efficiency is greatly increased.
*	Maintain cursor position when focus on an input element.
*	Maintain same globalization option in initialization process.

#### 1.6.4 (2024-01-28)
*	Minor optimization.

#### 1.6.3 (2024-01-22)
*	Add number format support of Slovenian(sl) and French(fr) locale. (Contributor: [ahotko](https://github.com/ahotko))

#### 1.6.2 (2024-01-05)
*	Minor optimization.

#### 1.6.1 (2023-09-29)
*	Minor optimization.

#### 1.6.0 (2023-09-29)
*	Add number format globalization support.
*	`IMPORTANT` Change attribute name from ~~[data-enable-highlight-minus]~~ to [data-highlight-minus], apologize for the inconvenience.
*	[data-highlight-minus] can recognize hex without '#' now, but not recommended.

#### 1.5.8 (2023-07-14)
*	Add support for jQuery's no Conflict mode. (Contributor: [Squibler](https://github.com/Squibler))

#### 1.5.7 (2023-06-02)
*	Change NumberUtil() to an extended object of jQuery: $.NumberUtil.

#### 1.5.6 (2023-05-21)
*	Remove unused exports of the internal utils.

#### 1.5.5 (2023-05-20)
*	NumberUtil().quotient() miscalculation fixed.

#### 1.5.4 (2023-05-10)
*	Optimize for min.js.

#### 1.5.3 (2023-05-08)
*	Smart minus unable to trigger change event fixed.

#### 1.5.2 (2023-05-08)
*	[data-sum] function unable to refresh sum input element fixed.

#### 1.5.1 (2023-05-07)
*	Initial release
