/*!
 * jquery.maxlength.js - version 1.5.2 - 2023-05-08
 * Copyright (c) 2023 scintilla0 (https://github.com/scintilla0)
 * @license MIT License http://www.opensource.org/licenses/mit-license.html
 * @license GPL2 License http://www.gnu.org/licenses/gpl.html
 *
 * A plugin for dynamic decimal max length auto-configuration.
 * Requires jQuery.
 * Add the attribute [data-max-length="$minus$integral.$fractional"] to enable automatic configuration, e.g. [data-max-length="-5.2"]．
 * Values of 0 for the integral limit, as well as any other unreadable parameters, will be reset to the default value of {integral: 9}.
 * Add the attribute [data-disable-autofill] to disable fractional autofill.
 * Add the attribute [data-disable-auto-comma] to disable comma autofill.
 * Add the attribute [data-disable-smart-minus] to disable smart minus configuration.
 * Add the attribute [data-disable-init-refresh] to disable the initial refresh.
 * Add the attribute [data-enable-highlight-minus="$hex"] to enable highlighting of negative values in either default red or the assigned hexadecimal color.
 * Add the attribute [data-horizontal-align="$align"] to customize text align position.
 * Add the attribute [data-sum="$selector"] to enable quick sum calculation on DOM elements matched by the jQuery selector, e.g. [data-sum="input.score"].
 * NumberUtil is an open decimal calculating utility for use.
 */
let NumberUtil;
(function() {
	const DOT_KEY = [110, 190], MINUS_KEY = [109, 189], COMMON_KEY = {V: 86, X: 88};
	const NUMBER_KEY = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
	const FUNCTION_KEY = {F5: 116, esc: 27, backspace: 8, del: 46, tab: 9, enter: 13, enterSub: 108,
			pageUp: 33, pageDown: 34, end: 35, home: 36, left: 37, right: 38, up: 39, down: 40};
	const KEY_TYPE = {NONE: 0, DOT: 1, MINUS: 2, NUMBER: 3, FUNCTION: 4};
	const DEFAULT_CANCEL_LENGTH = {integral: 9};
	const CORE = {VALID_CHARACTER: '-.0123456789', MINUS: '-', DOT: '.', ZERO: '0', COMMA: ',', EMPTY: '',
			INTEGRAL: "integral", FRACTIONAL: "fractional", ALLOW_MINUS: "minus",
			DEFAULT_ID: '_max_length_no_', MAX_LENGTH: "data-max-length", INIT_FRESH: "data-disable-init-refresh",
			AUTOFILL: "data-disable-autofill", AUTO_COMMA: "data-disable-auto-comma",SMART_MINUS: "data-disable-smart-minus",
			HIGHLIGHT_MINUS: "data-enable-highlight-minus", HORIZONTAL_ALIGN: "data-horizontal-align", SUM: "data-sum",
			HEX_REGEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/};
	const DEFAULT_CSS = {HORIZONTAL_ALIGN: 'right', MINUS_COLOR: '#FF0000'};
	const HORIZONTAL_ALIGN_OPTION = ['left', 'center', 'right', 'inherit'];
	const CommonUtil = _CommonUtil();
	const NumberUtil_ = _NumberUtil();

	let maxLengthBuffer = {};
	let contentBuffer;

	let selector = "[" + CORE.MAX_LENGTH + "]";
	$(selector).each((_, item) => {
		prepareStyle(item);
		prepareMaxLength(item);
	});
	$(document)
		.on("dragstart", selector, dragstartAction)
		.on("keydown", selector, keydownAction)
		.on("focus", selector, focusAction)
		.on("blur", selector, blurAction)
		.on("compositionstart", selector, compositionstartAction)
		.on("compositionend", selector, compositionendAction);
	$(selector + ":not([" + CORE.INIT_FRESH + "])").each((_, item) => {
		focusAction({target: $(item)[0]});
		blurAction({target: $(item)[0]});
	});
	$("[" + CORE.SUM + "]").each(sum);

	function dragstartAction({target: dom}) {
		if (dom.selectionStart !== dom.selectionEnd) {
			return false;
		}
	}

	function keydownAction({target: dom, keyCode: keyCode, ctrlKey: ctrlKey}) {
		let maxLength = getMaxLength(dom);
		let combineKeyResult = isCombineKeyValid(dom, maxLength, keyCode, ctrlKey);
		if (CommonUtil.exists(combineKeyResult)) {
			return combineKeyResult;
		}
		return isSingleInputValid(dom, maxLength, keyCode);
	}

	function focusAction({target: dom}) {
		let value = dom.value;
		if (dataSetAbsent(dom, CORE.AUTOFILL)) {
			value = NumberUtil_.drainFractional(value);
		}
		if (dataSetAbsent(dom, CORE.AUTO_COMMA)) {
			value = NumberUtil_.undressNumber(value);
		}
		/* TODO
		let originalValue = dom.value;
		let originalCursorPos = dom.selectionEnd;
		let cursorPos = 0;
		$(dom).focus();
		for (let index = 0; index < originalCursorPos && index < originalValue.length && cursorPos < value.length; index ++) {
			if (originalValue[index] === value[cursorPos]) {
				cursorPos ++;
			}
		}
		dom.selectionEnd = cursorPos;
		*/
		dom.value = value;
		if (!dataSetAbsent(dom, CORE.HIGHLIGHT_MINUS)) {
			dom.style.setProperty("color", '');
		}
	}

	function blurAction({target: dom}) {
		let value = NumberUtil_.drainIntegral(dom.value);
		if (dataSetAbsent(dom, CORE.AUTOFILL)) {
			value = NumberUtil_.fillFractional(value, getMaxLength(dom)[CORE.FRACTIONAL]);
		}
		if (dataSetAbsent(dom, CORE.AUTO_COMMA)) {
			value = NumberUtil_.dressNumber(value);
		}
		dom.value = value;
		if (!dataSetAbsent(dom, CORE.HIGHLIGHT_MINUS)) {
			if (value.includes(CORE.MINUS)) {
				let minusColor = $(dom).attr(CORE.HIGHLIGHT_MINUS);
				dom.style.setProperty("color", CORE.HEX_REGEX.test(minusColor) ? minusColor : DEFAULT_CSS.MINUS_COLOR);
			} else {
				dom.style.setProperty("color", '');
			}
		}
	}

	function compositionstartAction({target: dom}) {
		contentBuffer = dom.value;
	}

	function compositionendAction({target: dom}) {
		dom.value = contentBuffer;
		contentBuffer = null;
	}

	function prepareStyle(dom) {
		let horizontalAlignProperty = $(dom).attr(CORE.HORIZONTAL_ALIGN);
		if (!HORIZONTAL_ALIGN_OPTION.includes(horizontalAlignProperty)) {
			horizontalAlignProperty = undefined;
		}
		horizontalAlignProperty = CommonUtil.exists(horizontalAlignProperty) ? horizontalAlignProperty : DEFAULT_CSS.HORIZONTAL_ALIGN;
		dom.style.setProperty("text-align", horizontalAlignProperty);
	}

	function prepareMaxLength(dom) {
		let id = dom.id;
		if (CommonUtil.isBlank(id)) {
			id = CORE.DEFAULT_ID + Object.values(maxLengthBuffer).length;
			dom.id = id;
		}
		let source = $(dom).attr(CORE.MAX_LENGTH);
		if (CommonUtil.isBlank(source) || isNaN(Number(source))) {
			maxLengthBuffer[id] = DEFAULT_CANCEL_LENGTH;
			return;
		}
		if (source.startsWith(CORE.DOT) || source.endsWith(CORE.DOT) || (!source.startsWith(CORE.MINUS) && source.includes(CORE.MINUS))) {
			maxLengthBuffer[id] = DEFAULT_CANCEL_LENGTH;
			return;
		}
		let absSource = source.includes(CORE.MINUS) ? source.substring(1) : source;
		let sourceSep = absSource.split(CORE.DOT);
		if (isNaN(Number(sourceSep[0])) || (absSource === CORE.ZERO && isNaN(Number(sourceSep[1])))) {
			maxLengthBuffer[id] = DEFAULT_CANCEL_LENGTH;
			return;
		}
		let maxLength = {};
		maxLength[CORE.INTEGRAL] = Number(sourceSep[0]);
		if (maxLength[CORE.INTEGRAL] === 0) {
			maxLength[CORE.INTEGRAL] = DEFAULT_CANCEL_LENGTH[CORE.INTEGRAL];
		}
		if (absSource.indexOf(CORE.DOT) !== -1 && sourceSep[1] !== CORE.ZERO) {
			maxLength[CORE.FRACTIONAL] = Number(sourceSep[1]);
		}
		if (source.startsWith(CORE.MINUS)) {
			maxLength[CORE.ALLOW_MINUS] = 1;
		}
		maxLengthBuffer[id] = maxLength;
	}

	function getMaxLength(dom) {
		let maxLength = maxLengthBuffer[dom.id];
		if (!CommonUtil.exists(maxLength)) {
			prepareStyle(dom);
			prepareMaxLength(dom);
			maxLength = maxLengthBuffer[dom.id];
		}
		return maxLength;
	}

	function isCombineKeyValid(dom, maxLength, keyCode, ctrlKey) {
		if (ctrlKey) {
			if (keyCode === COMMON_KEY.V) {
				let value = dom.value;
				let selectionEnd = dom.selectionEnd;
				setTimeout(() => {
					let afterValue = dom.value;
					let absAfterValue = afterValue.includes(CORE.MINUS) ? afterValue.substring(1) : afterValue;
					let block = false;
					if (!CommonUtil.exists(maxLength[CORE.ALLOW_MINUS]) && afterValue.includes(CORE.MINUS)) {
						block = true;
					} else if (!CommonUtil.exists(maxLength[CORE.FRACTIONAL]) && afterValue.includes(CORE.DOT)) {
						block = true;
					} else if (afterValue.replace(CORE.DOT).includes(CORE.DOT)) {
						block = true;
					} else if (afterValue.replace(CORE.MINUS).includes(CORE.MINUS)) {
						block = true;
					} else {
						let absAfterValueSep = absAfterValue.split(CORE.DOT);
						if (absAfterValueSep[0].length > maxLength[CORE.INTEGRAL]) {
							block = true;
						} else if (CommonUtil.exists(absAfterValueSep[1]) && CommonUtil.exists(maxLength[CORE.FRACTIONAL])) {
							if (absAfterValueSep[1].length > maxLength[CORE.FRACTIONAL]) {
								block = true;
							}
						}
					}
					if (block === false) {
						for (let index in afterValue) {
							if (!CORE.VALID_CHARACTER.includes(afterValue[index])) {
								block = true;
								break;
							}
						}
					}
					if (block === true) {
						dom.value = value;
						dom.selectionEnd = selectionEnd;
					}
				});
				return true;
			} else if (keyCode === COMMON_KEY.X) {
				return isSelectOperationValid(dom, maxLength);
			} else {
				return true;
			}
		}
		return null;
	}

	function isSingleInputValid(dom, maxLength, keyCode) {
		let keyType = getKeyType(keyCode);
		let value = dom.value;
		let selectionStart = dom.selectionStart, selectionEnd = dom.selectionEnd;
		let cursorPos = selectionEnd;
		let disableSmartMinus = $(dom).attr(CORE.SMART_MINUS);
		if (keyType === KEY_TYPE.NONE) {
			return false;
		}
		if (keyType === KEY_TYPE.MINUS) {
			if (!CommonUtil.exists(disableSmartMinus)) {
				if (CommonUtil.exists(maxLength[CORE.ALLOW_MINUS])) {
					dom.value = value.includes(CORE.MINUS) ? value.substring(1) : CORE.MINUS + value;
					setTimeout(() => {
						let afterCursorPos = cursorPos + (value.includes(CORE.MINUS) ? -1 : 1);
						if (cursorPos === 0 && value.includes(CORE.MINUS)) {
							afterCursorPos = 0;
						}
						dom.selectionEnd = afterCursorPos;
					});
				}
				return false;
			} else {
				if (!CommonUtil.exists(maxLength[CORE.ALLOW_MINUS])) {
					return false;
				} else if (selectionStart === 0 && selectionEnd === value.length) {
					return true;
				} else if (value.includes(CORE.MINUS)) {
					return false;
				} else if (cursorPos !== 0) {
					return false;
				} else {
					return true;
				}
			}
		}
		if (keyType === KEY_TYPE.DOT) {
			if (!CommonUtil.exists(maxLength[CORE.FRACTIONAL])) {
				return false;
			} else if (selectionStart === 0 && selectionEnd === value.length) {
				dom.value = '0.';
				return false;
			} else if (value.includes(CORE.DOT)) {
				return false;
			} else if (value.includes(CORE.MINUS) && cursorPos === 0) {
				return false;
			} else {
				let valueSep = [value.substring(0, cursorPos), value.substring(cursorPos, value.length)];
				let valueSep0 = valueSep[0];
				valueSep[0] = valueSep[0].includes(CORE.MINUS) ? valueSep[0].substring(1) : valueSep[0];
				if ((!value.includes(CORE.MINUS) && cursorPos === 0) || (value.includes(CORE.MINUS) && (cursorPos === value.indexOf(CORE.MINUS) + 1))) {
					if (valueSep[0].length <= maxLength[CORE.INTEGRAL] && valueSep[1].length <= maxLength[CORE.FRACTIONAL]) {
						dom.value = valueSep0 + '0.' + valueSep[1];
					}
					return false;
				} else if (valueSep[0].length > maxLength[CORE.INTEGRAL] || valueSep[1].length > maxLength[CORE.FRACTIONAL]) {
					return false;
				} else {
					return true;
				}
			}
		}
		let absValue = value.includes(CORE.MINUS) ? value.substring(1) : value;
		let valueSep = absValue.split(CORE.DOT);
		let dotPos = value.indexOf(CORE.DOT);
		if (keyType === KEY_TYPE.NUMBER) {
			if (selectionStart === 0 && selectionEnd === value.length) {
				return true;
			} else if (value.includes(CORE.MINUS) && cursorPos === value.indexOf(CORE.MINUS)) {
				return false;
			} else {
				if (!value.includes(CORE.DOT)) {
					if (valueSep[0].length >= maxLength[CORE.INTEGRAL]) {
						return false;
					} else {
						return true;
					}
				} else {
					if (valueSep[0].length >= maxLength[CORE.INTEGRAL] && cursorPos <= dotPos) {
						return false;
					} else if (valueSep[1].length >= maxLength[CORE.FRACTIONAL] && cursorPos > dotPos) {
						return false;
					} else {
						return true;
					}
				}
			}
		}
		if (keyType === KEY_TYPE.FUNCTION) {
			if (selectionStart === 0 && selectionEnd === value.length) {
				return true;
			} else if (keyCode === FUNCTION_KEY.backspace) {
				if (selectionStart !== selectionEnd) {
					return isSelectOperationValid(dom, maxLength);
				} else if (value.includes(CORE.DOT) && cursorPos === dotPos + 1 && valueSep[0].length + valueSep[1].length > maxLength[CORE.INTEGRAL]) {
					return false;
				} else {
					return true;
				}
			} else if (keyCode === FUNCTION_KEY.del) {
				if (selectionStart !== selectionEnd) {
					return isSelectOperationValid(dom, maxLength);
				} else if (value.includes(CORE.DOT) && cursorPos === dotPos && valueSep[0].length + valueSep[1].length > maxLength[CORE.INTEGRAL]) {
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}
		}
		return false;
	}

	function isSelectOperationValid(dom, maxLength) {
		let value = dom.value;
		let selectionStart = dom.selectionStart, selectionEnd = dom.selectionEnd;
		let selectedValue = value.substring(selectionStart, selectionEnd);
		if (selectedValue.length === 0) {
			return true;
		} else if (selectedValue.includes(CORE.DOT)) {
			let absValue = value.includes(CORE.MINUS) ? value.substring(1) : value;
			let absLength = absValue.length - (selectionEnd - selectionStart);
			if (absLength > maxLength[CORE.INTEGRAL]) {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}

	function getKeyType(keyCode) {
		if (DOT_KEY.includes(keyCode)) {
			return KEY_TYPE.DOT;
		} else if (MINUS_KEY.includes(keyCode)) {
			return KEY_TYPE.MINUS;
		} else if (NUMBER_KEY.includes(keyCode)) {
			return KEY_TYPE.NUMBER;
		} else if (Object.values(FUNCTION_KEY).includes(keyCode)) {
			return KEY_TYPE.FUNCTION;
		} else {
			return KEY_TYPE.NONE;
		}
	}

	function dataSetAbsent(dom, dataSetName) {
		return !CommonUtil.exists($(dom).attr(dataSetName));
	}

	function sum(_, item) {
		let selector = $(item).attr(CORE.SUM);
		$(document).on("change", selector, function() {
			CommonUtil.setValue(NumberUtil_.selectorSum(selector), true, item);
		});
	}

	NumberUtil = _NumberUtil;
	function _NumberUtil() {
		const RECURSION_FLAG = "recursion_flag";

		function mix2Number(source, recursionFlag) {
			let result = null;
			if (CommonUtil.exists(source)) {
				if (typeof source === "number") {
					result = source;
				} else if (typeof source === "string") {
					let trimmedSource = source.trim().replaceAll(CORE.COMMA, CORE.EMPTY);
					if (!CommonUtil.isBlank(trimmedSource)) {
						trimmedSource = Number(trimmedSource);
						if (!isNaN(trimmedSource)) {
							result = trimmedSource;
						} else if (recursionFlag !== RECURSION_FLAG && !CommonUtil.isBlank(source)) {
							let newSource = null;
							if ($(source).length === 0) {
								newSource = CommonUtil.getValue(source);
							}
							result = mix2Number(newSource, RECURSION_FLAG);
						}
					}
				}
			}
			return result;
		}

		/* private */ function getDecimalPlace(source) {
			let decimalPlace = 0;
			let splitSource = source.toString().split(CORE.DOT);
			if (splitSource.length > 1) {
				decimalPlace = splitSource[1].length;
			}
			return decimalPlace;
		}

		/* private */ function removeDecimalPoint(source) {
			return Number(source.toString().replace(CORE.DOT, CORE.EMPTY));
		}

		/* private */ function coreSum(addend1, addend2) {
			let decimalPlace1 = getDecimalPlace(addend1);
			let decimalPlace2 = getDecimalPlace(addend2);
			let maxDecimalPlace = Math.max(decimalPlace1, decimalPlace2);
			let decimalPlaceMultiplicator1 = Math.pow(10, maxDecimalPlace - decimalPlace1);
			let decimalPlaceMultiplicator2 = Math.pow(10, maxDecimalPlace - decimalPlace2);
			let decimalPlaceMultiplicator = Math.pow(10, maxDecimalPlace);
			return (removeDecimalPoint(addend1) * decimalPlaceMultiplicator1 + removeDecimalPoint(addend2) * decimalPlaceMultiplicator2) / decimalPlaceMultiplicator;
		}

		function sum(...addends) {
			let result = 0;
			for (let addend of addends) {
				addend = mix2Number(addend);
				if (addend !== null) {
					result = coreSum(result, addend);
				}
			}
			return result;
		}

		function blendSum(...addends) {
			let result = 0;
			let positive = true;
			for (let addend of addends) {
				if (typeof addend === "boolean") {
					positive = addend;
					continue;
				}
				addend = mix2Number(addend);
				if (addend != null) {
					if (!positive) {
						addend = Number(-(addend));
					}
					result = coreSum(result, addend);
				}
			}
			return result;
		}

		function selectorSum(...addendsSelectors) {
			let result = 0;
			for (let addendsSelector of addendsSelectors) {
				$(addendsSelector).each((_, item) => {
					let addend = mix2Number($(item).val());
					if (addend !== null) {
						result = coreSum(result, addend);
					}
				});
			}
			return result;
		}

		/* private */ function coreProduct(multiplicator1, multiplicator2) {
			let decimalPlaceMultiplicator = Math.pow(10, getDecimalPlace(multiplicator1) + getDecimalPlace(multiplicator2));
			return (removeDecimalPoint(multiplicator1) * removeDecimalPoint(multiplicator2)) / decimalPlaceMultiplicator;
		}

		function product(...multiplicators) {
			let result = null;
			for (let multiplicator of multiplicators) {
				multiplicator = mix2Number(multiplicator);
				if (multiplicator !== null) {
					if (result === null) {
						result = 1;
					}
					result = coreProduct(result, multiplicator);
				}
			}
			return result;
		}

		function productNoticeNull(...multiplicators) {
			let result = 1;
			for (let multiplicator of multiplicators) {
				multiplicator = mix2Number(multiplicator);
				if (multiplicator === null) {
					multiplicator = 0;
				}
				result = coreProduct(result, multiplicator);
			}
			return result;
		}

		function selectorProduct(...multiplicatorsSelectors) {
			let result = null;
			for (let multiplicatorsSelector of multiplicatorsSelectors) {
				$(multiplicatorsSelector).each((_, item) => {
					let multiplicator = mix2Number($(item).val());
					if (multiplicator !== null) {
						if (result === null) {
							result = 1;
						}
						result = coreProduct(result, multiplicator);
					}
				});
			}
			return result;
		}

		function selectorProductNoticeNull(...multiplicatorsSelectors) {
			let result = 1;
			for (let multiplicatorsSelector of multiplicatorsSelectors) {
				$(multiplicatorsSelector).each((_, item) => {
					let multiplicator = mix2Number($(item).val());
					if (multiplicator === null) {
						multiplicator = 0;
					}
					result = coreProduct(result, multiplicator);
				});
			}
			return result;
		}

		/* private */ function coreQuotient(dividend, divisor) {
			let decimalPlaceMultiplicator = Math.pow(10, getDecimalPlace(dividend) + getDecimalPlace(divisor));
			return (removeDecimalPoint(dividend) / removeDecimalPoint(divisor)) / decimalPlaceMultiplicator;
		}

		function quotient(dividend, divisor) {
			dividend = mix2Number(dividend);
			divisor = mix2Number(divisor);
			if (dividend === null || divisor === null || divisor === 0) {
				return 0;
			}
			return coreQuotient(dividend, divisor);
		}

		/* private */ function coreRounding(source, decimalPlace, roundingOperation) {
			let multiplicator = Math.pow(10, decimalPlace);
			let result = source * multiplicator;
			result = roundingOperation.apply(null, [result]);
			return result / multiplicator;
		}

		function round(source, decimalPlace = 0) {
			return coreRounding(mix2Number(source), decimalPlace, source => Math.round(source));
		}

		function floor(source, decimalPlace = 0) {
			return coreRounding(mix2Number(source), decimalPlace, source => Math.floor(source));
		}

		function ceil(source, decimalPlace = 0) {
			return coreRounding(mix2Number(source), decimalPlace, source => Math.ceil(source));
		}

		function dressNumber(source) {
			if (mix2Number(source) === null) {
				return source;
			}
			source = source.toString().trim();
			source = source.replaceAll(CORE.COMMA, CORE.EMPTY);
			let sourceSep = source.split(CORE.DOT);
			let result = sourceSep[0].replace(/\.+$/g, '').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
			if (CommonUtil.exists(sourceSep[1])) {
				result = result + CORE.DOT + sourceSep[1];
			}
			return result;
		}

		function undressNumber(source) {
			if (mix2Number(source) === null) {
				return source;
			}
			source = source.toString().trim();
			return source.replaceAll(CORE.COMMA, CORE.EMPTY);
		}

		function drainIntegral(source) {
			if (mix2Number(source) === null) {
				return source;
			}
			source = source.toString().trim();
			let hasMinus = source.includes(CORE.MINUS);
			let resultAbs = source.replace(CORE.MINUS, CORE.EMPTY);
			while (resultAbs.startsWith(CORE.ZERO)) {
				resultAbs = resultAbs.substring(1);
			}
			if (resultAbs.length === 0 || resultAbs.startsWith(CORE.DOT)) {
				resultAbs = CORE.ZERO + resultAbs;
			}
			return (hasMinus ? CORE.MINUS : CORE.EMPTY) + resultAbs;
		}

		function drainFractional(source) {
			if (mix2Number(source) === null) {
				return source;
			}
			source = source.toString().trim();
			let sourceSep = source.split(CORE.DOT);
			let result = sourceSep[1];
			if (!CommonUtil.exists(result)) {
				result = CORE.EMPTY;
			}
			while (result.endsWith(CORE.ZERO)) {
				result = result.substring(0, result.length - 1);
			}
			return sourceSep[0] + (result.length !== 0 ? (CORE.DOT + result) : CORE.EMPTY);
		}

		function fillFractional(source, fractionalLength) {
			if (mix2Number(source) === null || !CommonUtil.exists(fractionalLength) || fractionalLength === 0) {
				return source;
			}
			source = source.toString().trim();
			let sourceSep = source.split(CORE.DOT);
			let result = sourceSep[1];
			if (!CommonUtil.exists(result)) {
				result = CORE.EMPTY;
			}
			return sourceSep[0] + CORE.DOT + result.padEnd(fractionalLength, CORE.ZERO);
		}

		return {
			sum: sum,
			blendSum: blendSum,
			selectorSum: selectorSum,
			product: product,
			productNN: productNoticeNull,
			selectorProduct: selectorProduct,
			selectorProductNN: selectorProductNoticeNull,
			quotient: quotient,
			round: round,
			floor: floor,
			ceil: ceil,
			mix2Number: mix2Number,
			dressNumber: dressNumber,
			undressNumber: undressNumber,
			drainIntegral: drainIntegral,
			drainFractional: drainFractional,
			fillFractional: fillFractional,
			setValue: CommonUtil.setValue,
			getValue: CommonUtil.getValue
		};
	}

	function _CommonUtil() {
		function exists(object) {
			return (typeof object !== "undefined" && object !== undefined && object !== null);
		}

		function isBlank(string) {
			return !(exists(string) && string.trim() !== '');
		}

		let throttleTimer = {};

		function throttle(callback, domId, delay = 0) {
			if (throttleTimer[domId] == null) {
				throttleTimer[domId] = setTimeout(() => throttleTimer[domId] = null, delay);
				setTimeout(() => callback.apply());
			} else {
				clearTimeout(throttleTimer[domId]);
				throttleTimer[domId] = setTimeout(() => throttleTimer[domId] = null, delay);
			}
		}

		function setValue(value, doChange, ...selectors) {
			for (let selector of selectors) {
				$(selector).each((_, item) => {
					if ($(item).is("input:radio, input:checkbox")) {
						$(item).prop("checked", false);
						$(item).filter("[value='" + value.toString() + "']").prop("checked", true);
					} else if ($(item).is("input:text, input:hidden, textarea, select")) {
						$(item).val(value);
					} else if ($(item).is("label, span")) {
						$(item).text(value);
					} else if ($(item).is("a")) {
						$(item).attr("href", value);
					}
					if (doChange === true) {
						throttle(() => $(item).blur().change(), $(item).attr("id"));
					}
				});
			}
		}

		function getValue(selector) {
			if ($(selector).is("input:radio, input:checkbox")) {
				return $(selector).filter(":checked").val();
			} else if ($(selector).is("input:text, input:hidden, textarea, select")) {
				return $(selector).val();
			} else if ($(selector).is("label, span")) {
				return $(selector).text();
			} else if ($(selector).is("a")) {
				return $(selector).attr("href");
			}
		}

		return {
			exists: exists,
			isBlank: isBlank,
			throttleTimer: throttleTimer,
			throttle: throttle,
			setValue: setValue,
			getValue: getValue
		};
	}

}) ();