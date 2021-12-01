'use strict';

// custom assertion module that can be switched off.
// does a lot of JS type checking (runtime)

// historically theArr.includes() wasn't available! maintained for back compatibitily.
const _arrContainsValue = (function(theArr, theValue) 
{
	return theArr.includes(theValue);
});

// Field = Prop - NB: will include any props from base objects.
const _objContainsField =  (function(theObj, theValue) 
{
	var isContained = false;
	for (var v in theObj) {
		isContained = (v === theValue);
		if (isContained) break;
	}
	return isContained;
});

const _objMustHaveFields = (function(theObj, theValues) 
{
	if (theValues.length === 0 || !theObj) return true;

	var isContaining = true;
	for (var v of theValues) {
		if (!_objContainsField(theObj, v)) {
			isContaining = false;
			break;
		}
	}
	return isContaining;
});

const _objCanOnlyHaveFields = (function(theObj, theValues)
{
	var isOkay = true;
	if (!theObj) return isOkay;
	
	for (var v in theObj) {
		isOkay = (_arrContainsValue(theValues, v ));
		if (!isOkay) break;
	}
	return isOkay;
});

const _checkObject = (function(theObject, theMandatory, theOptional, theMsg)
{
	var allFields = theMandatory.concat(theOptional);
	ok(_objMustHaveFields(theObject, theMandatory), theMsg);
	ok(_objCanOnlyHaveFields(theObject, allFields), theMsg);
});


//--- EXPORTS BELOW.

//---
let _assertionOn = true;

export function setAssertion(value)
{
	_assertionOn = value;
}

const TRACE = true;
export function ok(theConstraint, theMessage)
{
	if (!_assertionOn) return;

	if (!theConstraint) 
	{
		var aMessage = theMessage;
		aMessage = "Assertion Error: " + aMessage + '\n\n' + new Date() + '\n';
		
		if (TRACE) console.trace();
		throw aMessage;
	}
	return;
}

export function okFunction(theFn)
{
	if (!_assertionOn) return;
	ok(typeof theFn === 'function', 'error - not a function: ' + theFn);
}

export function okArray(theArr, allowUndefined = false)
{
	if (!_assertionOn) return;

	if ( ! (allowUndefined && (theArr === undefined)) )
	{	
		var isArray = (theArr && theArr.constructor === Array);
		ok(isArray, 'Error - not an Array: ' + JSON.stringify(theArr));
	}
}

export function okObject(theObj, allowNullOrUndefined)
{
	if (!_assertionOn) return;

	var isObject = false;
	
	if ( allowNullOrUndefined && ((theObj === null) || (theObj === undefined)) )
		isObject = true;
	else 
		isObject = (typeof theObj === 'object');

	ok(isObject, 'Error - not an Object: ' + JSON.stringify(theObj));
}

export function okString(theString)
{
	if (!_assertionOn) return;
	ok(typeof theString === 'string', 'error - not a string: ' + theString);
}

export function okNum(theNum)
{
	if (!_assertionOn) return;
	ok( theNum !== 'NaN' && typeof theNum === 'number' , 'error - not a number: ' + theNum);
}


export function okIfZero(theValue)
{
	if (!_assertionOn || theValue || (theValue === 0)) return;
	ok(false, "Value is not Zero and is Falsy");
}

export function notUndefined(theValue)
{
	if ( !_assertionOn || (theValue !== undefined) ) return;
	ok(false, "Value is Undefined - shound not be: " + theValue);
}

//---
let _typeArr = [];
export function regType(theTypeName, theMandatory, theOptional, allowDuplicateOverride)
{
	ok(theTypeName);

	if (!allowDuplicateOverride)
	{
		ok(!_typeArr[theTypeName], "Duplidate type: " + theTypeName);
	}

	var t = _typeArr[theTypeName] = {};
	t.mandatory = theMandatory || [];
	t.optional = theOptional || [];

	return theTypeName;
}

export function okType(theTypeName, theObject, theMsg)
{
	if (!_assertionOn) return;

	ok( _typeArr[theTypeName], "No such type: " + theTypeName + " " + theMsg);
	var m = _typeArr[theTypeName].mandatory;
	var o = _typeArr[theTypeName].optional;
	
	_checkObject(theObject, m, o, theMsg);
}

//---
let _enums = {};
export function regEnum(theEnumName, theEnumValues, allowDuplicateOverride)
{

	if (!allowDuplicateOverride)
	{
		ok(!_enums[theEnumName], "Duplidate Enum: " + theEnumName);
	}

	_enums[theEnumName] = theEnumValues;

	return theEnumName;
}

export function okEnum(theEnumName, theValue, theMsg)
{
	if (!_assertionOn) return;
	
	var allowed = _enums[theEnumName];

	if (theValue !== undefined)
	{
		const isAllowedValue = allowed.includes(theValue);
		ok(isAllowedValue, theMsg + "Enum value error (enum, value) " + theEnumName + " " + theValue);
	}
}

export function okImplies(theCondition, theImpliedValue, theMsg)	// theCondition -> theImpliedValue
{
	if (!_assertionOn) return;
	ok(!theCondition || theImpliedValue, "assert implication rule broken " + theMsg);
}
