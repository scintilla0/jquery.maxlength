# jquery.maxlength.js

A plugin for dynamic decimal max length auto-configuration.

CDN URL:
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.maxlength@latest/jquery.maxlength.js`

CDN URL(min.js):
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.maxlength@latest/jquery.maxlength.min.js`

### [Demo](https://codepen.io/scintilla_0/full/MWPQJWv)

### Change log

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
*	Change attribute name from [data-enable-highlight-minus] to [data-highlight-minus], apologize for the inconvenience.
*	[data-highlight-minus] can recognize hex without '#' now, but not recommended.

#### 1.5.8 (2023-07-14)
*	Add support for jQuery's no Conflict mode. (Contributor: [Squibler](https://github.com/Squibler))

#### 1.5.7 (2023-06-02)
*	Change NumberUtil() to an extended object of jQuery: $.NumberUtil.

#### 1.5.6 (2023-05-21)
*	Remove unused exports of the internal util.

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
