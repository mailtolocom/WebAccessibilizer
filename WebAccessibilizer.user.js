// ==UserScript==
// @name        WebAccessibilizer
// @description Make web pages accessible for blind users with screen readers
// @namespace   mailtoloco
// @author      Yannick Youale mailtoloco2011@gmail.com
// @copyright   Copyright 2019 Yannick Youale
// @license     BSD
// @include     *
// @version     0.2
// @grant       none
// ==/UserScript==

// if you want to change the language for the script
// change it in the following line
var lang = "en";
// supported languages are: fr, en.

// these are the public variables we need
var tl_xx = {}; // for translations
var tColors = [];
var isStarted = false;
var lastLevel = 0;
var currentLevel = 0;
var currentPos = 0;
var currentNode = null;
var currentNodeChildren = null;
var searchedText = "";
var mouseX = 0;
var mouseY = 0;
var descriptionTimeout = -1;
var descriptionLevel = -1;
//
var accessibilityParameters;
var frmAccessibility;
var frmParameter;
//
var keyShortcuts = [];

function onPageLoad(){
// when the page has loaded
var i;
var s;
var elm;
try{
// we signal that the treatments has started
isStarted = true;

// we identify the language of the navigator
lang = getLanguage();
// and we make some treatments according to it
switch(lang){
case "fr": // 
tl_xx = tl_fr;
tColors = tColors_fr;
break;
case "en": // 
tl_xx = tl_en;
tColors = tColors_en;
break;
default: // 
tColors = tColors_en;
break;
} // End switch

// we initialize some global variables for dom exploration
currentNode = null;
currentLevel = 1;
currentNodeChildren = [];
currentNodeChildren.push(document.getElementsByTagName("body")[0]);
currentPos = 0;

// we complete the known color array
for(i=0; i<tColors.length; i++){
s = tColors[i].code;
// the red value of the color
tColors[i].r = parseInt(s.substring(0, 3));
// the green value of the color
tColors[i].g = parseInt(s.substring(3, 6));
// the blue value of the color
tColors[i].b = parseInt(s.substring(6, 9));
} // End For

// we get the saved accessibility parameters informations
accessibilityParameters = getSavedAccessibilityParameters();

// we create the verious graphical hidden objects
frmAccessibility = new ClFrmAccessibility();
frmParameter = new ClFrmParameter();

// the initial implementation of accessibility parameters
implementAccessibilityParameters();

} catch(ex){
prompt("erreur " + ex.name, "onPageLoad- " + ex.message);
} // End Try
} // End Function

function onPageKeyDown(e){
// à while pressing keys
var i;
var j;
var k = e.keyCode;
var s;
var t;

try{

// F2 = 113
if(k == 113){
if(e.shiftKey == false && e.ctrlKey == false && e.altKey == false){
if(0 == 1){ // deactivation
// by a timeout, we will take into account
// the number of f2 pressing quickly
// it will define the number of level to reach over the selected element.
descriptionLevel++;
window.clearTimeout(descriptionTimeout);
descriptionTimeout = window.setTimeout(function(){
describeCurrentNode(false, descriptionLevel);
descriptionLevel = -1;
}, 500);
return true;
} // end if deactivation
} else if(e.shiftKey == true && e.ctrlKey == true && e.altKey == false){
if(frmAccessibility){
frmAccessibility.show();
} // end if
return true;
} // end if
} // end if

// treatement of accessibility shortcuts
for(i=0; i<keyShortcuts.length; i++){
s = keyShortcuts[i];
if(s.e.keyCode == e.keyCode){
if(s.e.shiftKey==e.shiftKey && s.e.ctrlKey==e.ctrlKey && s.e.altKey==e.altKey){
// according to the action
switch(s.action){
case "5": // to say the containing text
t = s.param2 + ". "; // the announcing text
for(j=0; j<s.elm.length; j++){
t += s.elm[j].innerText + "\r\n";
} // End For
saystring(t);
break;
case "6": //  to bring the focus
saystring(s.param2);
// a little delay before really focussing
window.setTimeout(function(){
s.elm[0].focus();
}, 1000);
break;
case "7": //  to make a click
saystring(s.param2);
// a little delay before really clicking
window.setTimeout(function(){
var evt = document.createEvent("MouseEvents");
evt.initMouseEvent("click", true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
s.elm[0].dispatchEvent(evt);
}, 1000);
break;
} // End switch
return true;
} // End If
} // End If
} // End For

} catch(ex){
prompt("erreur " + ex.name, " onPageKeyDown ex- " + ex.message);
} // End Try
} // end function

function onPageMouseMove(e){
// when the mouse cursor move
mouseX = e.pageX;
mouseY = e.pageY;
} // end function

function onPageStructureChange(e){
//
saystring("oui");
} // End Function

function tl(key, arg1="", arg2="", arg3="", arg4="", arg5=""){
// translation function
var s = tl_xx[key];
if(arg5){
s = s.replace("%5", arg5);
} // End If
if(arg4){
s = s.replace("%4", arg4);
} // End If
if(arg3){
s = s.replace("%3", arg3);
} // End If
if(arg2){
s = s.replace("%2", arg2);
} // End If
if(arg1){
s = s.replace("%1", arg1);
} // End If
//
return s;
} // End Function

function getLanguage(){
/// identify and set the language
if (navigator.browserLanguage){
var language = navigator.browserLanguage; // for internet explorer
} else {
var language = navigator.language;
} // end if
// then we check
if(language.indexOf('fr') > -1){
return "fr";
} else { // by default it's english
return "en";
} // end if
} // End Function

function getCurrentDate(precision=2){
// renvoi la date et l'heure courante au format yyyy/mm/dd hh:mm:ss
// en précision, 1 renvoi la date uniquement
// et 2 renvoi la date et l'heure
var thistime = new Date();
var s = "";

var year = thistime.getFullYear();
var month = thistime.getMonth() + 1;
var day = thistime.getDate();
//
if(eval(month) < 10){ month ="0" + month; }
if(eval(day) < 10){ day = "0" + day; }
//
s = year + "/" + month + "/" + day;

if(precision > 1){
var hours = thistime.getHours();
var minutes = thistime.getMinutes();
var seconds = thistime.getSeconds();
//
if(eval(hours) < 10){ hours =" 0" + hours; }
if(eval(minutes) < 10){ minutes = "0" + minutes; }
if(seconds < 10){ seconds = "0" + seconds; }
//
s = s + " " + hours + ":" + minutes + ":" + seconds;
} // end if

// renvoi
return s;
} // end function

function getUniqIdentifier(){
// return an uniq identifier to assign as identifier to verious objects
var u = getCurrentDate(2);
// we remove from it non numerical characters
while(u.indexOf(" ") >= 0){
u = u.replace(" ", "");
} // End while
while(u.indexOf("/") >= 0){
u = u.replace("/", "");
} // End while
while(u.indexOf("-") >= 0){
u = u.replace("-", "");
} // End while
while(u.indexOf(":") >= 0){
u = u.replace(":", "");
} // End while
// we add a random number at the end between 1000 and 2000
var r = parseInt(Math.random() * (2000 - 1000) + 1000);
u = u + r;
// we convert it in hexadecimal
u = convertDecimal2hexadecimal(parseInt(u));
// and we return
return u;
} // End Function

function getPageElements(){
// return all the interesting elements of the current web page
var i;
var j;
var elm;
var col = [];
// first we add the body tag
col.push(document.body);
// we browse the elements of the body tag
// and in same time we are going to exclude some of them
for(i=0; i<document.body.childNodes.length; i++){
elm = document.body.childNodes[i];
// if it is an element to avoid
if(isElementAvoidable(elm) == true){
continue;
} // End If
// we get all the children of this element
try{
var col2 = elm.getElementsByTagName("*");
for(j=0; j<col2.length; j++){
col.push(col2[j]);
} // End For
} catch(ex){
// nothing
} // End Try
} // End For
//
return col;
} // End Function

function getPageTree(){
// return the tree of the current page from the body tag
// it's a way of making a kind of picture of the dom

var scan = function(elm, pos){
var node = {};
node.tagName = elm.tagName;
node.id = elm.id;
node.name = elm.name;
node.className = elm.className;
node.position = pos;
node.elm = elm;
node.childNodes = [];
// if he get some children
if(elm.childNodes.length > 0){
node.childNodes.length = elm.childNodes.length;
for(k=0; k<elm.childNodes.length; k++){
node.childNodes[k] = scan(elm.childNodes[k], k);
node.childNodes[k].parentNode = node;
} // End For
} // End If
//
return node;
}; // end of temporary function

var tree = [];
tree.push(scan(document.body, -1));
tree[0].parentNode = null;

//
return tree;
} // End Function

function getElementReference(){
// generate a reference for the current selected element
// in the dom explorer 
var elm;
var parent;
var i;

try{
// we identify the selected element in the dom explorer
elm = currentNodeChildren[currentPos];
if(! elm){
return null;
} // End If

// we are going to define what makes this element uniq
var r = {};
r.tagName = "";
r.id = "";
r.name = "";
r.className = "";
r.child = null;
while(true){

// we get infos on the element
r.tagName = elm.tagName;
if(! elm.id){
r.id = "";
} else {
r.id = elm.id;
} // End If
if(! elm.name){
r.name = "";
} else {
r.name = elm.name;
} // End If
if(! elm.className){
r.className = "";
} else {
r.className = elm.className;
} // End If

// we find its position within its ciblings
r.position = -1;
parent = elm.parentNode;
if(parent){
for(i=0; i<parent.childNodes.length; i++){
if(parent.childNodes[i] == elm){
r.position = i;
break;
} // End If
} // End For
} // end if

// if there is no other element with these precisions in the dom
if(isOtherMatch(elm) == false){
return r;
} // End If

// we go up till the parent
// if there is one
if(! parent){
return null;
} // End If
elm = parent;
var rParent = {};
rParent.tagName = "";
rParent.id = "";
rParent.name = "";
rParent.className = "";
rParent.position = -1;
rParent.child = r;
r = rParent;
} // End while

// failure
return null;
} catch(ex){
alert("error " + ex.name + " getElementReference ex- " + ex.message);
} // End Try
} // End Function

function findElementByReferenceAbsolute(r){
// to find a precise element by it reference
// not that if it is found,
// it will be returned  an array with only one item
// otherwice an empty array.
var i;
var col = getPageElements();
// var col = document.all;
var elm;
var flag;
var rSave = r;

try{
//
for(i=0; i<col.length; i++){
elm = col[i];
// if it is the good starting element
if(isReferenceMatch(elm, r) == true){
// if there is no child to find
if(! r.child){
return [elm];

} else { // we should find within the children of the first found
while(true){
if(elm.childNodes.length > r.child.position){
elm = elm.childNodes[r.child.position];
r = r.child;
if(isReferenceMatch(elm, r) == true){
if(! r.child){
// there is no other children to find
// we have reach our destination
return [elm];
} else { // there a sub child to reach
continue;
} // End If there is another child or not
} // End If the child matche or not
} else { // the search sequence is been broken
r = rSave;
break; // we come out from the while
} // end if there is enough children
} // End while
} // End If
} // End If
} // End For
// failure
return []; // an empty array
} catch(ex){
prompt("error " + ex.name, " findElementByReferenceAbsolute ex- " + ex.message);
return [];
} // End Try
} // End Function

function findElementByReferenceRelative(r){
// find all elements responding to the reference
var i;
var j;
var elm;
var found = [];
var col = getPageElements();
// var col = document.all;
var flag;
var rParent = r;

// we create a temporary function to check validity
var isMatch = function(elm){
try{
if(r.tagName){
if(elm.tagName.toLowerCase() != r.tagName.toLowerCase()){
return false;
} // End If
} // end if
if(r.id){
if(elm.id != r.id){
return false;
} // End If
} // End If
if(r.name){
if(elm.name != r.name){
return false;
} // End If
} // End If
if(r.className){
if(elm.className != r.className){
return false;
} // End If
} // End If
if(r.position){
if(elm.parentNode.childNodes[parseInt(r.position)] != elm){
return false;
} // End If
} // End If
} catch(ex){
return false;
} // End Try
// correct for this one
return true;
};

// we browse all the element of the document
for(i=0; i<col.length; i++){
elm = col[i];
// if the first one match
if(isMatch(elm)){
// if there is no other children
if(r.child == null){
found.push(elm);
} else { // there is a definition of children
// we search recursevely
while(true){
r = r.child;
var col2 = elm.getElementsByTagName("*");
for(j=0; j<col2.length; j++){
elm = col2[j];
if(isMatch(elm)){
if(! r.child){
found.push(elm);
} else {
continue;
} // End If
} // End If
} // End For
if(! r.child){
break;
} // End If
} // End while
} // End If there is a child or not
} // end if the first one match
} // End For
// we return the array of element found
return found;
} // End Function

function isReferenceMatch(elm, r){
// check if the element match the reference
try{
if(elm.tagName != r.tagName){
return false;
} // End If
if(r.id != ""){
if(elm.id != r.id){
return false;
} // End If
} // End If
if(r.name != ""){
if(elm.name != r.name){
return false;
} // End If
} // End If
if(r.className != ""){
if(elm.className != r.className){
return false;
} // End If
} // End If
// we return the success
return true;
} catch(ex){
prompt("error " + ex.name, " isReferenceMatch ex- " + ex.message);
} // End Try
} // End Function

function isOtherMatch(elm){
// find if there is another element that match the caracteristicals of the given one
var i;
var e;
var col = document.all;
try{
for(i=0; i<col.length; i++){
e = col[i];
if(e != elm){
if(e.tagName == elm.tagName){
var flag = true;
if(e.id != elm.id){
flag = false;
} // End If
if(e.name != elm.name){
flag = false;
} // End If
if(e.className != elm.className){
flag = false;
} // End If
//
if(flag == true){
return true;
} // End If
} // End If
} // End If
} // End For
return false;
} catch(ex){
alert("error " + ex.name + " isOtherMatch ex- " + ex.message);
} // End Try
} // End Function

function isElementAvoidable(elm){
// should the treatement avoid this element ?
if(elm.id == "message_to_say_yyd"){
return true;
} // End If
if(elm.id == "explorer_zone_yyd"){
return true;
} // End If
if(elm.id == "dom_explorer_yyd"){
return true;
} // End If
if(elm.id == "frmAccessibility_yyd"){
return true;
} // End If
if(elm.id == "frmParameter_yyd"){
return true;
} // End If
// no reason to avoid the treatment of this element
return false;
} // End Function

function getSavedAccessibilityParameters(){
// in the local storage
var j;
var s = localStorage.getItem("accessibilityParameters");
// if contains nothing
if(! s){
// we get the current web site domain
var url_site = location.hostname;
// we create an empty json object
j = {};
j.url_site = url_site;
j.id = getUniqIdentifier();
j.dateCreation = getCurrentDate();
j.parameters = [];
return j;
} // End If
j = JSON.parse(s);
// the return
return j;
} // End Function

function saveAccessibilityParameters(){
// in the local storage
var j = accessibilityParameters;
// first we check if all the parts are there
if(! j.id){
j.id =getUniqIdentifier();
} // End If
if(! j.dateCreation){
j.dateCreation = getCurrentDate();
} // End If
// we alsho check for particular parameters
for(var i=0; i<j.parameters.length; i++){
if(! j.parameters[i].id){
j.parameters[i].id = getUniqIdentifier();
} // End If
if(! j.parameters[i].status){
j.parameters[i].status = "0";
} // End If
if(! j.parameters[i].dateCreation){
j.parameters[i].dateCreation = getCurrentDate();
} // End If
if(! j.parameters[i].typeReference){
j.parameters[i].typeReference = "1"; // absolute by default
} // end if
} // End For
// then we store in the local storage
localStorage.setItem("accessibilityParameters", JSON.stringify(accessibilityParameters));
} // End Function

function implementAccessibilityParameters(){
// after the page is loaded
// implement the parameters setteld to make verious element more accessible
var i;
var j;
var p;
var s;
var elm;
// we clear the shortcuts array
keyShortcuts = [];
// we browse the parameters in memory
for(i=0; i<accessibilityParameters.parameters.length; i++){
p = accessibilityParameters.parameters[i];
// if the parameter is not activated
if(p.status == 0 || p.status == "0"){
// we jump the treatment of the current parameter
continue;
} // End If
// we get the dom element referenced
// according to the type of reference precised
if(parseInt(p.typeReference) == 1){
elm = findElementByReferenceAbsolute(p.elementReference);
} else if(parseInt(p.typeReference) == 2){
elm = findElementByReferenceRelative(p.elementReference);
// alert(elm.length + " éléments relatifs trouvés");
} else {
elm = findElementByReferenceAbsolute(p.elementReference);
} // End If
// if nothing has been found
if(! elm || elm.length == 0){
continue; // failure, we jump to the next parameter
} // End If
// according to the type of action to do
switch(p.action){
case "1": // add a label to the element
for(j=0; j<elm.length; j++){
elm[j].setAttribute("aria-label", p.param1);
// elm[j].setAttribute("title", p.param1);
} // End For
break;
case "2": // say the text when there is change in the element
for(j=0; j<elm.length; j++){
// we use  aria arguments
elm[j].setAttribute("aria-live", "polite");
elm[j].setAttribute("aria-atomic", "false");
elm[j].setAttribute("aria-revelant", "addition");
} // End For
break;
case "3": // say a text when the element apeare
// not yet implemented
break;
case "4": // say a text when the element disapeare
// not yet implemented
break;
case "5": // assign key shortcut to say the containing text
s = {};
s.elm = elm;
s.e = convertKeyShortcut(p.param1);
s.action = p.action;
s.param1 = p.param1;
s.param2 = p.param2;
s.param3 = p.param3;
keyShortcuts.push(s);
break;
case "6": // assign key shortcut to bring the focus to the element
s = {};
s.elm = elm;
s.e = convertKeyShortcut(p.param1);
s.action = p.action;
s.param1 = p.param1;
s.param2 = p.param2;
s.param3 = p.param3;
keyShortcuts.push(s);
break;
case "7": // assign key shortcut to click on the element
s = {};
s.elm = elm;
s.e = convertKeyShortcut(p.param1);
s.action = p.action;
s.param1 = p.param1;
s.param2 = p.param2;
s.param3 = p.param3;
keyShortcuts.push(s);
break;
case "8": // automatically hide the element
for(j=0; j<elm.length; j++){
elm[j].setAttribute("aria-hidden", "true");
} // End For
break;
case "9": // assign an html attribute to the element
for(j=0; j<elm.length; j++){
elm[j].setAttribute(p.param1, p.param2);
} // End For
break;
case "10": // assign an aria style/role to the element
for(j=0; j<elm.length; j++){
switch(p.param1){
case "heading1": // 
case "heading2": // 
case "heading3": // 
case "heading4": // 
case "heading5": // 
case "heading6": // 
// we assign the style of title
elm[j].setAttribute("role", "heading");
// then we get and set the level to this title
s = p.param1;
s = s.substring(7);
elm[j].setAttribute("aria-level", s);
break;
default: // 
// we simply assign the new aria role
elm[j].setAttribute("role", p.param1);
break;
} // End switch
} // End For
break;
} // End switch
} // End For
} // End Function

function createNewOption(value, text){
// create and return a new option item
var o = document.createElement("option");
o.value = value;
o.text = text;
return o;
} // End Function

function listChildNodes(alowSpeech = true){
// list children of a node
var tbl;
var elm;
try{
//  if the selected node is empty
if(! currentNodeChildren[currentPos]){
// error
if(alowSpeech == true){
saystring("beep");
} // end if
return;
} // End If

// we get the children of the selected node
currentNode = currentNodeChildren[currentPos];
currentLevel = getNodeLevel(currentNode);
currentNodeChildren = getNodeChildren(currentNode);
currentPos = 0;
if(alowSpeech == true){
// we say informations
sayCurrentNode();
} // End If
} catch(ex){
alert("erreur listChildNodes- " + ex.message);
} // End Try
} // End Function

function listParentNodes(alowSpeech = true){
// list parent nodes
try{

// if it is the root
if(currentNode == null || currentNode == document.getElementsByTagName("body")[0]){
currentLevel = 1;
currentNode = null;
currentNodeChildren = [];
currentNodeChildren.push(document.getElementsByTagName("body")[0]);
currentPos = 0;
if(alowSpeech == true){
sayCurrentNode();
} // end if
return;
} // End If

// we come out from the current node
var elm = currentNode;
currentNode = currentNode.parentNode;
if(currentNode){
currentLevel = getNodeLevel(currentNode);
currentNodeChildren = getNodeChildren(currentNode);
// we try to get the node index to select
currentPos = 0;
for(var i=0; i<currentNodeChildren.length; i++){
if(currentNodeChildren[i] == elm){
currentPos = i;
break;
} // End If
} // End For
} else {
currentLevel = 1;
currentNode = null;
currentNodeChildren = [];
currentNodeChildren.push(document.getElementsByTagName("body")[0]);
currentPos = 0;
} // end if
// we say it
if(alowSpeech == true){
sayCurrentNode();
} // end if
} catch(ex){
alert("erreur listParentNodes- " + ex.message);
} // End Try
} // End Function

function nextNode(){
//
try{
currentPos++;
if(currentPos >= currentNodeChildren.length){
currentPos = currentNodeChildren.length - 1;
} // End If
//
sayCurrentNode();
} catch(ex){
alert("erreur nextNode- " + ex.message);
} // End Try
} // End Function

function prevNode(){
//
try{
currentPos--;
if(currentPos < 0){
currentPos = 0;
} // End If
//
sayCurrentNode();
} catch(ex){
alert("erreur prevNode- " + ex.message);
} // End Try
} // End Function

function firstNode(){
// go to the first node
try{
currentLevel = 0;
currentPos = 0;
currentNode = null;
listChildNodes();
} catch(ex){
// nothing
} // End Try
} // End Function

function firstCibling(){
//
try{
currentPos = 0;
//
sayCurrentNode();
} catch(ex){
alert("erreur firstCibling- " + ex.message);
} // End Try
} // End Function

function lastCibling(){
//
try{
currentPos = currentNodeChildren.length - 1;
//
sayCurrentNode();
} catch(ex){
alert("erreur lastCibling- " + ex.message);
} // End Try
} // End Function

function findNode(){
// search for a node by its tag name, class name or id name
var s = prompt("Type the text to search", searchedText);
frmAccessibility.domExplorer.focus();
if(s != ""){
searchedText = s;
} else {
return;
} // End If
// 
findNext();
} // End Function

function findNext(){
// find the next node responding to the criteria
var i;
var j;
var s;
var s2;
var elm;
var flag;
var elements;
try{
//
s = searchedText.toLowerCase();
if(s == ""){
return;
} // End If
// the current selected node
elm = currentNodeChildren[currentPos];
if(elm == null){
return;
} // End If
//
flag = false;
elements = document.all;
for(i=0; i<elements.length; i++){
// if the search is autorized
if(flag == true){
// does it respond to the criteria
s2 = elements[i].tagName.toLowerCase();
if(s2 == s){
elm = elements[i];
// we get its parent
currentNode = elm.parentNode;
// we get its level
var parent = currentNode;
var level = 2;
while(parent != document.getElementsByTagName("body")[0]){
parent = parent.parentNode;
level++;
// security
if(level == 1000){
break;
} // End If
} // End while
currentLevel = level;
// we list its ciblings
currentNodeChildren = getNodeChildren(currentNode);
// we get its position
currentPos = -1;
for(j=0; j<currentNodeChildren.length; j++){
if(currentNodeChildren[j] == elm){
currentPos = j;
break;
} // End If
} // End For
// if the element has not been found
if(currentPos == -1){
// exceptionally we add it to the list
currentNodeChildren.push(elm);
// and we adjust the position
currentPos = currentNodeChildren.length - 1;
} // End If
// then we say it
sayCurrentNode();
return;
} // End If
} else { // flag == false
if(elements[i] == elm){
flag = true;
} // End If
} // End If
} // End For
// if here, then search failure
saystring("no next node found with this criteria");
} catch(ex){
alert("erreur findNext- " + ex.message);
} // End Try
} // End Function

function findPrev(){
//
} // End Function

function getNodeLevel(elm){
// return the level of an element
try{
var parent = elm;
var level = 2;
while(parent != document.getElementsByTagName("body")[0]){
parent = parent.parentNode;
level++;
// security
if(level == 1000){
break;
} // End If
} // End while
return level;
} catch(ex){
// alert("erreur " + ex.name + " getNodeLevel ex- " + ex.message);
return 1;
} // End Try
} // End Function

function getNodeChildren(elm){
// return the list of valid children inside an element
var i;
var tbl = [];
try{
// some checking
if(elm == null){
return tbl;
} // End If
// we list all the direct children of the body tag
elm = elm.childNodes;
// let us filter this list
tbl = [];
for(i=0; i<elm.length; i++){
// the name of the tag
var n = elm[i].tagName;
if(n != null){
n = n.toLowerCase();
} // End If
// the filter according to the tag name
// br, script, link, style, noscript
if(n==null || n=="br" || n=="script" || n=="link" || n=="style" || n=="noscript"){
// we do nothing
} else { // the tag is valid
// but we check some other exceptions
// according to the id of the element
if(isElementAvoidable(elm[i]) == true){
continue;
} // End If
if(0 == 1){ // deactivated
if(elm[i].offsetWidth==0 && elm[i].offsetHeight==0){
continue;
} // End If
} // end if deactivation
// we add to the list of valid tags
tbl.push(elm[i]);
} // End If
} // End For
// the return
return tbl;
} catch(ex){
alert("erreur getNodeChildren- " + ex.message);
} // End Try
} // End Function

function getNodeDescription(elm, precision=2){
// describe a html element
// according to the level of precision
var s;
try{
// the tag name
s = elm.tagName;
// we find its type if there is one
if(elm.type != null && elm.type != ""){
s = s + " type='" + elm.type + "'";
} // End If
// we find its id if there is one
if(elm.id != null && elm.id != ""){
s = s + " id='" + elm.id + "'";
} // End If
// we find its name if there is one
if(elm.name != null && elm.name != ""){
s = s + " name='" + elm.name + "'";
} // End If
// we find its class if there is one
if(elm.className != null && elm.className != ""){
s = s + " class='" + elm.className + "'";
} // End If
// we find its title if there is one
if(elm.title != null && elm.title != ""){
s = s + " title='" + elm.title + "'";
} // End If
// we find its alt if there is one
if(elm.alt != null && elm.alt != ""){
s = s + " alt='" + elm.alt + "'";
} // End If

if(precision >= 2){
// we try to get the absolut positions of
// its left and top
var parent = elm.offsetParent;
var posElmX = 0;
var posElmY = 0;
while(parent){
posElmX += parent.offsetLeft;
posElmY += parent.offsetTop;
parent = parent.offsetParent;
} // end while
var leftAbsolute = elm.offsetLeft + posElmX;
var topAbsolute = elm.offsetTop + posElmY;
// assignment
s = s + "\r\nleft=" + leftAbsolute;
s = s + "\r\ntop=" + topAbsolute;
if(precision >= 3){
// the right absolute and the bottom absolute
s = s + "\r\nright=" + (leftAbsolute + elm.offsetWidth);
s = s + "\r\nbottom=" + (topAbsolute + elm.offsetHeight);
} // end if
// we find the width and the height
s = s + "\r\nwidth=" + elm.offsetWidth;
s = s + "\r\nheight=" + elm.offsetHeight;
if(precision >= 3){
// we find the width and the height client
s = s + "\r\nclientWidth=" + elm.clientWidth;
s = s + "\r\nclientHeight=" + elm.clientHeight;
} // end if
// we find the background and the foreground color
// with their name and code
var c;
c = rzGetBackgroundColor(elm);
s = s + "\r\nbackgroundColor=" + getNearestColorName(c) + ", " + c;
c = rzGetColor(elm);
s = s + "\r\ntextColor=" + getNearestColorName(c) + ", " + c;
} // end if
// the return
return s;
} catch(ex){
alert("erreur getNodeDescription- " + ex.message);
} // End Try
} // End Function

function promptCurrentNode(){
// show the description of the current node in a prompt dialog
// in order to be copied ty the user
var s = "";
var elm;
try{
if(currentNodeChildren.length == 0){
return;
} // End If
if(currentNodeChildren[currentPos] == null){
return;
} // End If
//
elm = currentNodeChildren[currentPos];
// the node description
s = s + getNodeDescription(elm);
// we show it
prompt("Select and copy this description", s);
} catch(ex){
alert("erreur sayCurrentNode- " + ex.message);
} // End Try
} // End Function

function sayCurrentNode(){
// give vocal informations on the selected node
// in the accessibility controler
var s = "";
var elm;
try{
if(currentNodeChildren.length == 0){
saystring("no children");
return;
} // End If
if(currentNodeChildren[currentPos] == null){
saystring("child not recognized");
return;
} // End If
//
elm = currentNodeChildren[currentPos];
// if the level has changed
if(currentLevel != lastLevel){
s = s + "Level " + currentLevel + ", ";
lastLevel = currentLevel;
} // End If
// the node position
s = s + (currentPos + 1) + "/" + currentNodeChildren.length + ", ";
// the node description
s = s + getNodeDescription(elm, 1);
// we say it
saystring(s);
} catch(ex){
alert("erreur sayCurrentNode- " + ex.message);
} // End Try
} // End Function

function sayCurrentNodeNames(){
//
var s = "";
var elm = currentNodeChildren[currentPos];
s = elm.tagName;
// we find its type if there is one
if(elm.type != null && elm.type != ""){
s = s + " type='" + elm.type + "'";
} // End If
// we find its id if there is one
if(elm.id != null && elm.id != ""){
s = s + " id='" + elm.id + "'";
} // End If
// we find its name if there is one
if(elm.name != null && elm.name != ""){
s = s + " name='" + elm.name + "'";
} // End If
// we find its class if there is one
if(elm.className != null && elm.className != ""){
s = s + " class='" + elm.className + "'";
} // End If
//
saystring(s);
} // End Function

function sayCurrentNodeInnerText(showPrompt=false){
//
try{
var elm = currentNodeChildren[currentPos];
if(showPrompt == false){
saystring("InnerText=" + elm.innerText);
} else {
prompt("InnerText=", elm.innerText);
} // end if
} catch(ex){
// nothing
} // End Try
} // End Function

function sayCurrentNodeInnerHTML(showPrompt=false){
//
try{
var elm = currentNodeChildren[currentPos];
if(showPrompt == false){
saystring("InnerHTML=" + elm.innerHTML);
} else {
prompt("InnerHTML=", elm.innerHTML);
} // end if
} catch(ex){
// nothing
} // End Try
} // End Function

function sayCurrentNodeFontFamily(){
//
var s = "";
var elm = currentNodeChildren[currentPos];
s =rzGetStyle(elm, "font-family");
saystring("font-family=" + s);
} // End Function

function sayCurrentNodeColors(){
//
var s = "";
var elm = currentNodeChildren[currentPos];
// we find the background and the foreground color
// with their name and code
var c;
c = rzGetBackgroundColor(elm);
s = s + "\r\nbackgroundColor=" + getNearestColorName(c) + ", " + c;
c = rzGetColor(elm);
s = s + "\r\ntextColor=" + getNearestColorName(c) + ", " + c;
//
saystring(s);
} // End Function

function sayCurrentNodeBorders(){
//
var s = "Borders=";
var v = "";
var elm = currentNodeChildren[currentPos];
// border left
v = rzGetStyle(elm, "border-left");
s = s + " left:" + v;
// border top
v = rzGetStyle(elm, "border-top");
s = s + " top:" + v;
// border right
v = rzGetStyle(elm, "border-right");
s = s + " right:" + v;
// border bottom
v = rzGetStyle(elm, "border-bottom");
s = s + " bottom:" + v;
// and we say it
saystring(s);
} // End Function

function sayCurrentNodeDimensions(){
//
var s = "";
var elm = currentNodeChildren[currentPos];
// we find the width and the height
s = s + "\r\nwidth=" + elm.offsetWidth;
s = s + "\r\nheight=" + elm.offsetHeight;
//
saystring(s);
} // End Function

function sayCurrentNodePositions(){
//
var s = "";
var elm = currentNodeChildren[currentPos];
// we try to get the absolut positions of
// its left and top
var parent = elm.offsetParent;
var posElmX = 0;
var posElmY = 0;
while(parent){
posElmX += parent.offsetLeft;
posElmY += parent.offsetTop;
parent = parent.offsetParent;
} // end while
var leftAbsolute = elm.offsetLeft + posElmX;
var topAbsolute = elm.offsetTop + posElmY;
// assignment
s = s + "\r\nleft=" + leftAbsolute;
s = s + "\r\ntop=" + topAbsolute;
//
saystring(s);
} // End Function

function sayCurrentNodeMargin(){
// to say the margins
var s = "Margins=";
var v = "";
var elm = currentNodeChildren[currentPos];
// marginleft
v = rzGetStyle(elm, "margin-left");
s = s + " left:" + v;
// margintop
v = rzGetStyle(elm, "margin-top");
s = s + " top:" + v;
// marginright
v = rzGetStyle(elm, "margin-right");
s = s + " right:" + v;
// marginbottom
v = rzGetStyle(elm, "margin-bottom");
s = s + " bottom:" + v;
// and we say it
saystring(s);

// this part has been deactivated
if(0 == 1){
// we find the width and the height
var s = "";
var elm = currentNodeChildren[currentPos];
//
var mLeft = elm.clientLeft - elm.offsetLeft;
var mTop = elm.clientTop + elm.offsetTop;
var mRight = elm.offsetWidth - elm.clientLeft - elm.clientWidth;
var mBottom = elm.offsetHeight - elm.clientTop - elm.clientHeight;
//
s = "Borders left=" + mLeft + ", top=" + mTop + ", right=" + mRight + ", bottom=" + mBottom;
//
saystring(s);
} // end if deactivation
} // End Function

function describeCurrentNode(showInPrompt, parentLevel=0){
// describe the node at the cursor's position
// or its parent according to the level given
var i;
var s;
var elm;
// activeElement, elementFromPoint, selection, getSelection, 

// the activeElement
elm = document.activeElement;
// if a parent is needed
if(parentLevel > 0){
for(i=0; i<parentLevel; i++){
elm = elm.parentNode;
// the case if no parent
if(! elm){
saystring("No parent");
return;
} // End If
} // End For
} // End If
// the description
s = getNodeDescription(elm);
if(showInPrompt == true){
prompt("Select and copy this description", s);
} else {
saystring("activeElement= " + s);
} // end if
} // End Function

function describeCurrentPage(){
// try to describe all the main html element of the current web page
try{
var i = 0;
var s = "";
var bod = document.getElementsByTagName("body")[0];
var elm;
var tbl;
// we extract firsts informations on the body tag
s = getNodeDescription(bod);
s = s + "\r\n\r\n";
// we list all the direct children of the body tag
elm = bod.childNodes;
// let us filter this list
tbl = [];
for(i=0; i<elm.length; i++){
// the name of the tag
var n = elm[i].tagName;
if(n != null){
n = n.toLowerCase();
} // End If
// the filter
// script, link, style, noscript
if(n==null || n=="script" || n=="link" || n=="style" || n=="noscript"){
// we do nothing
} else { // the tag is valid
// some other exceptions
if(elm[i].id == "message_to_say_yyd"){
continue;
} // End If
if(elm[i].offsetWidth==0 && elm[i].offsetHeight==0){
continue;
} // End If
// we add to the list of valid tags
tbl.push(elm[i]);
} // End If
} // End For
// we make the balance
s = s + "\r\nLe body contient " + tbl.length + " éléments principaux \r\n\r\n";
// we browse the list of valid tags
for(i=0; i<tbl.length; i++){
elm = tbl[i];
s = s + (i + 1) + ". " + getNodeDescription(elm);
s = s + "\r\n\r\n";
} // End For
// we show the text to copy in a prompt box
prompt("Description of the page:", s);
} catch(ex){
alert("describeCurrentPage- " + ex.message);
} // End Try
} // End Function

function rzGetStyle(elm, styleName){
// return the css style of an element
var v=null;
if(document.defaultView && document.defaultView.getComputedStyle){
var cs=document.defaultView.getComputedStyle(elm,null);
if(cs && cs.getPropertyValue) v=cs.getPropertyValue(styleName);
} // end if
if(!v && elm.currentStyle) v=elm.currentStyle[rzCC(styleName)];
return v;
} // end function

function rzGetVisibility(elm){
// return if the element is visible
// through its parents if necessary
var flag = true;
var v=rzGetStyle(elm, 'color');
while (!v || v=='transparent' || v=='#000000' || v=='rgba(0, 0, 0, 0)'){
if(elm==document.body) v='#fff'; else {
elm=elm.parentNode;
v=rzGetStyle(elm, 'color');
} // end if
} // end while
return v;
} // end function

function rzGetBackgroundColor(elm){
// return the background color of an element
// through its parents if necessary
var v=rzGetStyle(elm, 'background-color');
while (!v || v=='transparent' || v=='#000000' || v=='rgba(0, 0, 0, 0)'){
if(elm==document.body) v='#fff'; else {
elm=elm.parentNode;
v=rzGetStyle(elm,'background-color');
} // end if
} // end while
return v;
} // end function

function rzGetColor(elm){
// return the text  color of an element
// through its parents if necessary
var v=rzGetStyle(elm, 'color');
while (!v || v=='transparent' || v=='#000000' || v=='rgba(0, 0, 0, 0)'){
if(elm==document.body) v='#fff'; else {
elm=elm.parentNode;
v=rzGetStyle(elm, 'color');
} // end if
} // end while
return v;
} // end function

function getNearestColor(lRed, lGreen, lBlue){
// renvoi l'indice de la couleur la plus proche du tableau des couleurs connues
// en précisant s'il s'agit d'une correspondance exacte ou pas.
var lR;
var lG;
var lB;
var GapR;
var GapG;
var GapB;
var index;
var CurIndex;
var iColor = -1;
var i = 0;
try{
index = 1000000000;  // initialisation de l'indice de couleur
// parcours et comparaisons
for(i=0; i<tColors.length; i++){
// on identifie les valeurs rgb
lR = tColors[i].r;
lG = tColors[i].g;
lB = tColors[i].b;

// calcul des écarts
GapR = Math.abs(lR - lRed);
GapG = Math.abs(lG - lGreen);
GapB = Math.abs(lB - lBlue);
// création de l'indice d'écart
// et classement par ordre d'importance de l'écart
if(GapR >= GapG && GapG >= GapB){
GapR = GapR * 1000000;
GapG = GapG * 1000;
CurIndex = GapR + GapG + GapB;
// GoTo approx1
} else if(GapR >= GapB && GapB >= GapG){
GapR = GapR * 1000000;
GapB = GapB * 1000;
CurIndex = GapR + GapB + GapG;
// GoTo approx1
} else if(GapG >= GapR && GapR >= GapB){
GapG = GapG * 1000000;
GapR = GapR * 1000;
CurIndex = GapG + GapR + GapB;
// GoTo approx1
} else if(GapG >= GapB && GapB >= GapR){
GapG = GapG * 1000000;
GapB = GapB * 1000;
CurIndex = GapG + GapB + GapR;
// GoTo approx1
} else if(GapB >= GapR && GapR >= GapG){
GapB = GapB * 1000000;
GapR = GapR * 1000;
CurIndex = GapB + GapR + GapG;
// GoTo approx1
} else if(GapB >= GapG && GapG >= GapR){
GapB = GapB * 1000000;
GapG = GapG * 1000;
CurIndex = GapB + GapG + GapR;
// GoTo approx1
} // End If
// approx1:
// remplacement de valeur si différence inférieure
if(CurIndex < index){
index = CurIndex;
iColor = i;
// si égalité parfaite, on ressort
if(index == 0){
// on renvoi que ce n'est pas une approximation, mais une exactitude qui a été trouvée
return {"index":i, "exact":true};
} // End If
} // End If
} // Next i
// fin de la boucle de recherche
// on renvoi l'indice d'une couleur
// mais en précisant qu'elle n'est pas exacte
return {"index": iColor, "exact":false};
} catch(ex){
alert("getNearestColor- " + ex.message);
} // End Try
} // End Function

function getNearestColorName(c){
// return a color name as near as possible to the given color code
var i;
var s;
var tbl;
var r;
var g;
var b;
var o;
try{
//
if(! c){
return "Unknown color";
} // End If
// first we identify the type of color code
if(c.indexOf("rgb")>=0 && c.indexOf("(")>0 && c.indexOf(")")>0){
// it's a rgb color code
// nothing
} else { // its a exadecimal code
// we convert it to rgb
var col = convertExaToRGBColor(c);
c = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
} // End If
// we get the red, green and blue value of the color code
s = c.substring(c.indexOf("(") + 1);
s = s.substring(0, s.indexOf(")"));
tbl = s.split(",");
r = parseInt(tbl[0].trim());
g = parseInt(tbl[1].trim());
b = parseInt(tbl[2].trim());
// 
o = getNearestColor(r, g, b);
if(o.index == -1){
s = "Unknown color";
} else { // the color is valid
s = tColors[o.index].name;
// if it is an approximate color
if(o.exact == false){
s = "Proche de " + s;
} // End If
} // end if the color is valid or not
// we return this text
return s;
} catch(ex){
alert("getNearestColorName- " + ex.message);
} // End Try
} // End Function

function convertExaToRGBColor(color){
// convert from exadecimal to rgb color code
//
// Check for # infront of the value, if it's there, strip it
  if(color.substring(0,1) == '#'){
     color = color.substring(1);
} // end if
//
  var rgbColor = {};
// Grab each pair (channel) of hex values and parse them to ints using hexadecimal decoding
  rgbColor.r = parseInt(color.substring(0,2),16);
  rgbColor.g = parseInt(color.substring(2,4),16);
  rgbColor.b = parseInt(color.substring(4),16);
// the return
  return rgbColor;
 } // end function

function convertKeyShortcut(s){
// convert a string to an object representing a key shortcut
var tbl = [];
var i;
var k = {};
// we initialize the key object
k.key = "";
k.keyCode = 0;
k.code = 0;
k.shiftKey = false;
k.ctrlKey = false;
k.altKey = false;
// we treat the string shortcut
s = s.toLowerCase();
s = s.trim();
if(s.indexOf("+") > 0){
tbl = s.split("+");
} else {
tbl.push(s);
} // End If
// we treat the different parts of the shortcut
for(i=0; i<tbl.length; i++){
s = "" + tbl[i] + "";
s.trim();
switch(s){
case "shift": // 
k.shiftKey = true;
break;
case "ctrl": // 
k.ctrlKey = true;
break;
case "control": // 
k.ctrlKey = true;
break;
case "alt": // 
k.altKey = true;
break;
default: // other keyCode
try{
var e = new Event("keydown");
e.key = s.toUpperCase();
  e.keyCode=e.key.charCodeAt(0);
e.which=e.keyCode;
// transfert
k.key = e.key;
k.keyCode = e.keyCode;
k.code = e.code;
k.which=e.keyCode;
} catch(ex){
// nothing
} // End Try
break;
} // End switch
} // End For
// the return
return k;
} // End Function

function convertDecimal2hexadecimal(nb){
//
var nombre = nb;
return nombre.toString(16);
} // End Function

function convertReferenceObject2Text(refObject){
// convert a reference object to an understandable text
var s = "";
var sGlobal = "";
var r = {};
r.child = refObject;
var converter = function(r){
while(r.child){
r = r.child;
sGlobal = sGlobal + "\\ ";
s = "";
// the tag name
if(r.tagName){
s = s + r.tagName + " ";
} // End If
// id
if(r.id){
s = s + "#\"" + r.id + "\" ";
} // End If
// name
if(r.name){
s = s + "$\"" + r.name + "\" ";
} // End If
// class name
if(r.className){
s = s + ".\"" + r.className + "\" ";
} // End If
// position
if(r.position && parseInt(r.position)>=0 && r.position!=""){
if(isFinite(r.position)){
s = s + "/" + r.position + " ";
} // end if
} // End If
// we add to the global string
s = s.trim();
sGlobal = sGlobal + s + " ";
} // End while
}; // end function converter
// execution
converter(r);
// some after treatments
s = sGlobal;
s = s.trim();
s = s.substring(2);
s = s.trim();
// the return
return s;
} // End Function

function convertText2ReferenceObject(s){
// from the understandable text to the reference object
var i = 0;
var j;
var c;
var r = {};
var rParent = r;
var sValue = "";

// we create a temporary function for extracting a particular value
var getValue = function(iPos){
sValue = "";
for(j=(iPos + 2); j<s.length; j++){
var c2 = s[j];
if(c2 != '"'){
sValue = sValue + c2;
} else {
break;
} // End If
} // End For
// we move the position of the cursor
i = j;
// and we return the value
return sValue;
}; // end function getValue

// we insure that the object get all its properties
r.tagName = "";
r.id = "";
r.name = "";
r.className = "";
r.position = "";
r.child = null;

// we parse the string reference letter by letter
for(i=0; i<s.length; i++){
c = s[i];
switch(c){
case "#": // for id
r.id = getValue(i);
break;
case ".": // for class
r.className = getValue(i);
break;
case "$": // for name
r.name = getValue(i);
break
case "/": // for position
// if the next character is a quotation mark
if(s[i + 1] == '"'){
// we extract the value as other one
r.position = getValue(i);
} else if(isFinite(s[i + 1])){ // the number is just after the special character
// we are going to take it all
sValue = "";
for(j=(i + 1); j<s.length; j++){
if(isFinite(s[j]) && s[j] != " "){
sValue = sValue + s[j];
} else {
break;
} // End If
} // End For
r.position = sValue;
i = j;
} // end if
break;
case " ": // a space
continue; // to be ignored
break;
default: // other cases
// if it is a antislash representing a passage to a child
if(c == "\\"){
// we create the reference for the child
r.child = {};
r = r.child;
// we insure that the new object get all its properties
r.tagName = "";
r.id = "";
r.name = "";
r.className = "";
r.position = "";
r.child = null;
} else { // any alphabetical character for tag name
// we take it until a space
sValue = "";
for(j=i; j<s.length; j++){
if(s[j] != " "){
sValue = sValue + s[j];
} else {
break;
} // End If
} // End For
r.tagName = sValue;
i = j;
} // end if
break;
} // End switch
} // End For
// we return the first object that should contains all its children
return rParent;
} // End Function

function saystring(s){
// fonction d'accessibilité
// qui fait dire du texte par la synthèse vocale active
// en utilisant les balises d'accessibilité aria.
//
//o s'assure d'abord que les variables globales nécessaires ont bien été créées
if(this.compteur_yyd == null){
this.compteur_yyd = 0;
this.message_yyd = "";
this.timeout_yyd = 0;
} // end if
//
var elm;
var difference = "";
// on arrête un éventuel timer de ramasse miette
window.clearTimeout(this.timeout_yyd);
// on trouve la zone d'affichage du texte
elm = document.getElementById("message_to_say_yyd");
if(elm == null){ // non encore existante
// on crée cette zone
elm = document.createElement("div");
elm.setAttribute("id", "message_to_say_yyd");
elm.setAttribute("aria-live", "assertive");
elm.setAttribute("aria-atomic", "true");
elm.setAttribute("style", "width: 0%;height: 0%;");
// on l'ajoute à la fin de la balise body
document.getElementsByTagName("body")[0].appendChild(elm);
} // fin si zone du texte non encore existante
// si la zone a été repérée
if(elm != null){
// si le nouveau message est strictement identique à l'ancien
if(s == this.message_yyd){
// on va forcer un élément de différence
this.compteur_yyd = this.compteur_yyd + 1;
difference = " " + "-".repeat(this.compteur_yyd);
} else { // c'est vraiment un nouveau message
this.compteur_yyd = 0; // réinitialisation
} // end if
elm.innerText = "";
elm.innerText = s + difference;
} // end if elm non null
// enregistrement de ce message en mémoire
this.message_yyd = s
// on va programmer l'effacement du texte dans une demi seconde
var clearSaidMessage = function(){
document.getElementById("message_to_say_yyd").innerText = "";
};
this.timeout_yyd = window.setTimeout(clearSaidMessage, 500);
} // end function

function testor(){
// for testing
// related to the letter z
alert("WebAccessibilizer script is OK");
} // End Function

class ClFrmAccessibility{
// class to manage the main form of accessible parameters

constructor(){
// we are going to create the main accessibility form and hide it
this.frm = null;
this.lastSelectedElement = null;
var i;
var frm;
var elm
try{

// we create the form
frm = document.createElement("form");
this.frm = frm;
frm.setAttribute("role", "dialog");
frm.setAttribute("id", "frmAccessibility_yyd");
frm.setAttribute("style", "display: none;");
frm.addEventListener('submit', this.frm_Submit, true);
frm.addEventListener('blur', this.frm_Blur, true);

// we create a title inside the form
elm = document.createElement("h2");
elm.innerText = tl("accessibilisation_form_title");
frm.appendChild(elm);

// the dom explorer inside the form 
elm = document.createElement("select");
this.domExplorer = elm;
elm.setAttribute("id", "dom_explorer_yyd");
elm.setAttribute("title", tl("dom_explorer_title"));
elm.setAttribute("size", "3");
elm.addEventListener('focus', this.explorer_Focus, true);
elm.addEventListener('keydown', this.explorer_KeyDown, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the button to âdd a new parameter inside the form 
elm = document.createElement("button");
elm.innerText = tl("bt_add_text");
elm.addEventListener('click', this.btAdd_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the existing parameters list inside the form 
elm = document.createElement("select");
this.lstParameters = elm;
elm.setAttribute("id", "parameters_list_yyd");
elm.setAttribute("title", tl("existing_parameters_title"));
elm.setAttribute("size", "8");
elm.addEventListener('keydown', this.lstParameters_KeyDown, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the button to Modify the selected parameter inside the form 
elm = document.createElement("button");
elm.innerText = tl("bt_modify_text");
elm.addEventListener('click', this.btModify_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the button to delete the selected parameter inside the form 
elm = document.createElement("button");
elm.innerText = tl("bt_delete_text");
elm.addEventListener('click', this.btDelete_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the button to import configuration file inside the form 
elm = document.createElement("button");
elm.innerText = tl("bt_import_text");
elm.addEventListener('click', this.btImport_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the button to export configuration file inside the form 
elm = document.createElement("button");
elm.innerText = tl("bt_export_text");
elm.addEventListener('click', this.btExport_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the button to close/hide the form
elm = document.createElement("button");
this.btClose = elm;
elm.innerText = tl("bt_close_text");
elm.addEventListener('click', this.btClose_Click, true);
elm.addEventListener('keydown', this.btClose_KeyDown, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// we add the form at the end of the body tag
document.body.appendChild(frm);
} catch(ex){
alert("ClFrmAccessibility constructor- " + ex.message);
} // End Try
} // end function

frm_Submit(e){
e.preventDefault();
return false;
} // End Function

frm_Blur(e){
// when the current form loose focus
// frmAccessibility.hide();
} // End Function

explorer_Focus(e){
// when the dom explorer take the focus
// we are going to say the current node selected
// with a litle delay
window.setTimeout(function(){
// if the focus is still on the dom explorer
if(document.activeElement == frmAccessibility.domExplorer){
sayCurrentNode();
} // End If
}, 1000);
} // end function

explorer_KeyDown(e){
// à while pressing keys on the accessible dom explorer
var k = e.keyCode;
// saystring(k);

// left = 37
if(k == 37){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
listParentNodes();
return true;
} // end if
} // End If

// up = 38
if(k == 38){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
prevNode();
return true;
} // end if
} // End If

// right = 39
if(k == 39){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
listChildNodes();
return true;
} // end if
} // End If

// down = 40
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
if(k == 40){
nextNode();
return true;
} // end if
} // End If

// home = 36
if(k == 36){
if(e.shiftKey == false && e.ctrlKey == true && e.altKey == false){
firstNode();
return true;
} else if(e.shiftKey == false && e.ctrlKey == false && e.altKey == false){
firstCibling();
return true;
} // end if
} // End If

// end = 35
if(k == 35){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
lastCibling();
return true;
} // end if
} // End If

// n = 78 to get the names
if(k == 78){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
sayCurrentNodeNames();
return true;
} // end if
} // End If

// t = 84 to get the innerText
if(k == 84){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
// by a timeout, we will take into account
// the number of time this key is pressed quickly
// it will define the way information will be output
descriptionLevel++;
window.clearTimeout(descriptionTimeout);
descriptionTimeout = window.setTimeout(function(){
sayCurrentNodeInnerText((descriptionLevel >= 1));
descriptionLevel = -1;
}, 400);
e.preventDefault();
return false;
} // end if
} // End If

// h = 72 to get the inner html
if(k == 72){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
// by a timeout, we will take into account
// the number of time this key is pressed quickly
// it will define the way information will be output
descriptionLevel++;
window.clearTimeout(descriptionTimeout);
descriptionTimeout = window.setTimeout(function(){
sayCurrentNodeInnerHTML((descriptionLevel >= 1));
descriptionLevel = -1;
}, 400);
e.preventDefault();
return false;
} // end if
} // End If

// c = 67 to get the colors
if(k == 67){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
sayCurrentNodeColors()
return true;
} // end if
} // End If

// b = 66 to get the borders
if(k == 66){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
sayCurrentNodeBorders();
return true;
} // end if
} // End If

// m = 77 to get the margins
if(k == 77){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
sayCurrentNodeMargin();
return true;
} // end if
} // End If

// d = 68 to get the dimensions
if(k == 68){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
sayCurrentNodeDimensions();
return true;
} // end if
} // End If

// p = 80 to get the positions
if(k == 80){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
sayCurrentNodePositions();
return true;
} // end if
} // End If

// f = 70 to find a node or say the font family
if(k == 70){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
sayCurrentNodeFontFamily();
return true;
} else if(e.shiftKey==true && e.ctrlKey==false && e.altKey==false){
findNode();
return true;
} // end if
} // End If

// f3 = 114 to search next 
if(k == 114){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
e.preventDefault();
saystring("next");
findNext();
return true;
} // end if
} // End If

// enter = 13
if(k == 13){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
promptCurrentNode();
return true;
} // end if
} // End If

// z = 90 for testing
if(k == 90){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
testor();
return true;
} // end if
} // End If

// when pressing on shift+tab
// we move the focus to the last field of the form
// in order to make the navigation a cycle
if(e.keyCode == 9){ // tab
if(e.shiftKey==true && e.ctrlKey==false && e.altKey==false){
e.preventDefault();
frmAccessibility.btClose.focus();
return false;
} // End If
} // End If

} // end function

btAdd_Click(e){
//
frmAccessibility.hide();
frmParameter.show();
} // end function

lstParameters_KeyDown(e){
//
// saystring(e.keyCode);

// space = 32
// to activate or deactivate the current parameter

// uparrow = 38
// to move the parameter up in the list

// downarro = 40
// to move the parameter down in the list

// del = 46
// to delete the current parameter in the list
if(e.keyCode == 46){
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
frmAccessibility.btDelete_Click(null);
return false;
} // End If
} // End If


} // End Function

btModify_Click(e){
//
var parameterIndex = frmAccessibility.lstParameters.selectedIndex;
frmAccessibility.hide();
frmParameter.show(parameterIndex);
} // end function

btDelete_Click(e){
// to delete the selected parameter in the list of existing parameters
try{
var i;
var cur = frmAccessibility.lstParameters.selectedIndex;
var parameters = [];
// some checking
if(cur < 0){
alert(tl("error_parameter_selection"));
return;
} // End If
// we ask for a confirmation
if(! confirm(tl("msg_deletion"))){
return;
} // End If

// the deletion
// first in memory
for(i=0; i<accessibilityParameters.parameters.length; i++){
if(i != cur){
parameters.push(accessibilityParameters.parameters[i]);
} // End If
} // End For
accessibilityParameters.parameters = parameters;
// then in the visible list
frmAccessibility.clearParametersList();
// we refill it
frmAccessibility.fillParametersList();
// and we reset the selected item
frmAccessibility.lstParameters.selectedIndex = cur;
// and finally we record the changes in the local storage
saveAccessibilityParameters();
} catch(ex){
alert("erreur " + ex.name + " ClFrmAccessibility btDelete_click " + ex.message);
} // End Try
} // end function

btImport_Click(e){
// offer a way of importing parameters code with a json code
// only for the current web site
var i;
var nb;
var cur;
var s = prompt(tl("msg_importation"), "");
if(! s){
return;
} // End If
// we check if the given code is a valid json
var  j = JSON.parse(s);
if(! j){
alert(tl("error_import_json"));
return;
} // End If
// we check the presence of essential object in the json
if(! j.url_site || ! j.parameters){
alert(tl("error_import_formatting"));
return;
} // End If
// are they parameters for the good web site ?
if(j.url_site != location.hostname){
if(! confirm(tl("msg_confirm_location", j.url_site, location.hostname))){
return;
} // End If
} // End If
// here we try to import the new parameters
nb = 0;
for(i=0; i<j.parameters.length; i++){
accessibilityParameters.parameters.push(j.parameters[i]);
nb++;
} // End For
// we clear and refill the visible list of parameters
cur = frmAccessibility.lstParameters.selectedIndex;
frmAccessibility.clearParametersList();
frmAccessibility.fillParametersList();
frmAccessibility.lstParameters.selectedIndex = cur;
// and we save the changes
saveAccessibilityParameters()
// message of succès
alert(tl("msg_import_success", nb));
} // end function

btExport_Click(e){
// offer a way of exporting parameters code in a json code
// only for the current web site
var s = JSON.stringify(accessibilityParameters);
var msg = tl("msg_exportation");
prompt(msg, s);
} // end function

btClose_Click(e){
//
if(! frmAccessibility){
frmAccessibility = document.getElementById("frmAccessibility_yyd");
} // End If
frmAccessibility.hide();
frmAccessibility.lastSelectedElement = null;
saystring(tl("msg_accessibility_closing"));
} // end function

btClose_KeyDown(e){
// when pressing on tab
// we move the focus to the first field of the form
// to make the navigation a cycle
if(e.keyCode == 9){ // tab
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
e.preventDefault();
frmAccessibility.domExplorer.focus();
return false;
} // End If
} // End If
} // end function

clearParametersList(){
//
try{
this.lstParameters.options.length = 0;
} catch(ex){
alert("ClFrmAccessibility clearParametersList- " + ex.message);
} // End Try
} // End Function

fillParametersList(){
//
var i;
var s;
try{
for(i=0; i<accessibilityParameters.parameters.length; i++){
s = accessibilityParameters.parameters[i].description;
if(parseInt(accessibilityParameters.parameters[i].status) == 1){
s += " (on)";
} else {
s += " (off)";
} // End If
this.lstParameters.add(createNewOption(i, s));
} // End For
} catch(ex){
alert("ClFrmAccessibility fillParametersList- " + ex.message);
} // End Try
} // End Function

show(){
// to display the main accessibility form
saystring(tl("accessibilisation_form_title"));
window.setTimeout(function(){
var elm;
// but first, we empty the existing parameters list
frmAccessibility.clearParametersList();
// we refill it according to the virtual list
frmAccessibility.fillParametersList();

// in the dom explorer, we try to select the activeElement
if(frmAccessibility.lastSelectedElement == null){
elm = document.activeElement;
if(elm != null){
currentNode = elm;
listParentNodes(false);
} // End If
} // end if

// and we show the form
frmAccessibility.frm.style.display = "block";
// if there is no previous selected element
if(frmAccessibility.lastSelectedElement == null){
// we put the focus on the dom explorer
frmAccessibility.domExplorer.focus();
} else {
// we put the focus on the last selected element
frmAccessibility.lastSelectedElement.focus();
} // end if
saystring("Main accessibility form");
}, 1000);
} // end function

hide(){
// hide the main accessibility form
// but first, record the last selected element/field/control
frmAccessibility.lastSelectedElement = document.activeElement;
// and we hide
frmAccessibility.frm.style.display = "none";
} // End Function

} // end class

class ClFrmParameter{
// class to manage a particular accessibility parameter

constructor(){
// we are going to create the accessibility parameter form
this.parameter = null;
this.parameterIndex = -1;
this.frm = null;
var frm;
var elm

// we create the form
frm = document.createElement("form");
this.frm = frm;
frm.setAttribute("role", "dialog");
frm.setAttribute("id", "frmParameter_yyd");
frm.setAttribute("style", "display: none;");
frm.addEventListener('submit', this.frm_Submit, true);
frm.addEventListener('blur', this.frm_Blur, true);

// we create a title inside the form
elm = document.createElement("h2");
elm.innerText = tl("frm_parameter_title");
frm.appendChild(elm);

// the textbox of parameter description
elm = document.createElement("input");
this.txtDescription = elm;
elm.setAttribute("type", "text");
elm.setAttribute("title", tl("txt_description_title"));
elm.addEventListener('keydown', this.txtDescription_KeyDown, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the checkbox to activate or deactivate the parameter
elm = document.createElement("input");
this.chkStatus = elm;
elm.setAttribute("type", "checkbox");
elm.setAttribute("title", tl("chk_status_title"));
elm.addEventListener('change', this.chkStatus_Change, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the textbox of creation date
elm = document.createElement("input");
this.txtDateCreation = elm;
elm.setAttribute("type", "text");
elm.setAttribute("title", tl("txt_date_creation_title"));
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the textbox of the dom element reference
elm = document.createElement("input");
this.txtElementReference = elm;
elm.setAttribute("type", "text");
elm.setAttribute("title", tl("txt_dom_element_reference_title"));
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the combobox to precise the type of reference
elm = document.createElement("select");
this.cmbTypeReference = elm;
elm.setAttribute("title", tl("cmb_type_reference"));
// we add its items
elm.add(createNewOption("1", tl("reference_absolute")));
elm.add(createNewOption("2", tl("reference_relative")));
// we add to the form
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the combobox of action to apply
elm = document.createElement("select");
this.cmbAction = elm;
elm.setAttribute("title", tl("cmb_action_title"));
// we add its items
elm.add(createNewOption("1", tl("action1")));
elm.add(createNewOption("2", tl("action2")));
elm.add(createNewOption("3", tl("action3")));
elm.add(createNewOption("4", tl("action4")));
elm.add(createNewOption("5", tl("action5")));
elm.add(createNewOption("6", tl("action6")));
elm.add(createNewOption("7", tl("action7")));
elm.add(createNewOption("8", tl("action8")));
elm.add(createNewOption("9", tl("action9")));
elm.add(createNewOption("10", tl("action10")));
// the event
elm.addEventListener('change', this.cmbAction_Change, true);
// we add to the form
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the textbox of param1
elm = document.createElement("input");
this.txtParam1 = elm;
elm.setAttribute("type", "text");
elm.setAttribute("title", "param1");
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the textbox of param2
elm = document.createElement("input");
this.txtParam2 = elm;
elm.setAttribute("type", "text");
elm.setAttribute("title", "param2");
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the textbox of param3
elm = document.createElement("input");
this.txtParam3 = elm;
elm.setAttribute("type", "text");
elm.setAttribute("title", "param3");
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the combobox of available aria styles to apply on the selected element
elm = document.createElement("select");
this.cmbStyle = elm;
elm.setAttribute("title", tl("cmb_style_title"));
// we add its items
elm.add(createNewOption("alert", tl("aria_alert")));
elm.add(createNewOption("application", tl("aria_application")));
elm.add(createNewOption("article", tl("aria_article")));
elm.add(createNewOption("banner", tl("aria_banner")));
elm.add(createNewOption("button", tl("aria_button")));
elm.add(createNewOption("checkbox", tl("aria_checkbox")));
elm.add(createNewOption("columnheader", tl("aria_columnheader")));
elm.add(createNewOption("combobox", tl("aria_combobox")));
elm.add(createNewOption("complementary", tl("aria_complementary")));
elm.add(createNewOption("contentinfo", tl("aria_contentinfo")));
elm.add(createNewOption("dialog", tl("aria_dialog")));
elm.add(createNewOption("document", tl("aria_document")));
elm.add(createNewOption("form", tl("aria_form")));
elm.add(createNewOption("grid", tl("aria_grid")));
elm.add(createNewOption("gridcell", tl("aria_gridcell")));
elm.add(createNewOption("heading1", tl("aria_heading1")));
elm.add(createNewOption("heading2", tl("aria_heading2")));
elm.add(createNewOption("heading3", tl("aria_heading3")));
elm.add(createNewOption("heading4", tl("aria_heading4")));
elm.add(createNewOption("heading5", tl("aria_heading5")));
elm.add(createNewOption("heading6", tl("aria_heading6")));
elm.add(createNewOption("img", tl("aria_img")));
elm.add(createNewOption("input", tl("aria_imput")));
elm.add(createNewOption("link", tl("aria_link")));
elm.add(createNewOption("list", tl("aria_list")));
elm.add(createNewOption("listbox", tl("aria_listbox")));
elm.add(createNewOption("listitem", tl("aria_listitem")));
elm.add(createNewOption("log", tl("aria_log")));
elm.add(createNewOption("main", tl("aria_main")));
elm.add(createNewOption("math", tl("aria_math")));
elm.add(createNewOption("menu", tl("aria_menu")));
elm.add(createNewOption("menubar", tl("aria_menubar")));
elm.add(createNewOption("menuitem", tl("aria_menuitem")));
elm.add(createNewOption("menuitemcheckbox", tl("aria_menuitemcheckbox")));
elm.add(createNewOption("menuitemradio", tl("aria_menuitemradio")));
elm.add(createNewOption("navigation", tl("aria_navigation")));
elm.add(createNewOption("note", tl("aria_note")));
elm.add(createNewOption("option", tl("aria_option")));
elm.add(createNewOption("progressbar", tl("aria_progressbar")));
elm.add(createNewOption("radio", tl("aria_radio")));
elm.add(createNewOption("radiogroup", tl("aria_radiogroup")));
elm.add(createNewOption("row", tl("aria_row")));
elm.add(createNewOption("rowheader", tl("aria_rowheader")));
elm.add(createNewOption("search", tl("aria_search")));
elm.add(createNewOption("select", tl("aria_select")));
elm.add(createNewOption("status", tl("aria_status")));
elm.add(createNewOption("slider", tl("aria_slider")));
elm.add(createNewOption("tab", tl("aria_tab")));
elm.add(createNewOption("tablist", tl("aria_tablist")));
elm.add(createNewOption("tabpanel", tl("aria_tabpanel")));
elm.add(createNewOption("textbox", tl("aria_textbox")));
elm.add(createNewOption("timer", tl("aria_timer")));
elm.add(createNewOption("toolbar", tl("aria_toolbar")));
elm.add(createNewOption("tooltip", tl("aria_tooltip")));
elm.add(createNewOption("tree", tl("aria_tree")));
elm.add(createNewOption("treeitem", tl("aria_treeitem")));
elm.add(createNewOption("treegrid", tl("aria_treegrid")));
// the event
elm.addEventListener('change', this.cmbStyle_Change, true);
// we add to the form
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the button ok
elm = document.createElement("button");
elm.innerText = tl("bt_ok_text");
elm.addEventListener('click', this.btOK_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the button cancel
elm = document.createElement("button");
this.btCancel = elm;
elm.innerText = tl("bt_cancel_text");
elm.addEventListener('click', this.btCancel_Click, true);
elm.addEventListener('keydown', this.btCancel_KeyDown, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// we add the form at the end of the body tag
document.body.appendChild(frm);
} // end function

frm_Submit(e){
e.preventDefault();
return false;
} // End Function

frm_Blur(e){
// when the current form loose focus
// frmParameter.hide();
} // End Function

chkStatus_Change(e){
// when the checkbox of status is checked or unchecked
if(frmParameter.chkStatus.checked){
frmParameter.parameter.status = "1";
} else {
frmParameter.parameter.status = "0";
} // End If
} // End Function

txtDescription_KeyDown(e){
// when pressing on shift+tab
// we move the focus to the last field of the form
// in order to make the navigation a cycle
if(e.keyCode == 9){ // tab
if(e.shiftKey==true && e.ctrlKey==false && e.altKey==false){
e.preventDefault();
frmParameter.btCancel.focus();
return false;
} // End If
} // End If
} // End Function

cmbAction_Change(e){
// when the value has changed in the combobox of actions
// we will use it to hide or show additional parameters fields
var v = frmParameter.cmbAction.value;
// first we initialize the additional fields parameters
frmParameter.initializeAdditionalParameters();
// and we treat according to the new value
switch(v){
case "1": // 
frmParameter.txtParam1.title = "Type the text to add as a label to this element";
frmParameter.txtParam1.style.display = "block";
break;
case "2": // 
// no additional param to show here
break;
case "3": // 
frmParameter.txtParam1.title = "Type the text to say when this element apeare";
frmParameter.txtParam1.style.display = "block";
break;
case "4": // 
frmParameter.txtParam1.title = "Type the text to say when this element disapeare";
frmParameter.txtParam1.style.display = "block";
break;
case "5": // 
frmParameter.txtParam1.title = "Type the key shortcut to execute in order to read the text in the element. Ex: ctrl+shift+s";
frmParameter.txtParam1.style.display = "block";
frmParameter.txtParam2.title = "Type the text to say when the key shortcut is triggered";
frmParameter.txtParam2.style.display = "block";
break;
case "6": // 
frmParameter.txtParam1.title = "Type the key shortcut to execute in order to move to the element. Ex: ctrl+shift+s";
frmParameter.txtParam1.style.display = "block";
frmParameter.txtParam2.title = "Type the text to say when the key shortcut is triggered";
frmParameter.txtParam2.style.display = "block";
break;
case "7": // 
frmParameter.txtParam1.title = "Type the key shortcut to execute in order to click on the element. Ex: ctrl+shift+s";
frmParameter.txtParam1.style.display = "block";
frmParameter.txtParam2.title = "Type the text to say when the key shortcut is triggered";
frmParameter.txtParam2.style.display = "block";
break;
case "8": // 
// no additional param for this action
break;
case "9": // 
frmParameter.txtParam1.title = "Type the attribut name you want to assign to the element";
frmParameter.txtParam1.style.display = "block";
frmParameter.txtParam2.title = "Type the attribut value you want to assign to the element";
frmParameter.txtParam2.style.display = "block";
break;
case "10": // 
frmParameter.cmbStyle.style.display = "block";
break;
} // End switch
} // End Function

cmbStyle_Change(e){
// when another aria style to apply is been choosen
// we send its value to the param1 field
frmParameter.txtParam1.value = frmParameter.cmbStyle.value;
} // end function

initializeAdditionalParameters(){
// first we hide them all
frmParameter.txtParam1.style.display = "none";
frmParameter.txtParam2.style.display = "none";
frmParameter.txtParam3.style.display = "none";
frmParameter.cmbStyle.style.display = "none";
// then we initialize their titles
frmParameter.txtParam1.title = "";
frmParameter.txtParam2.title = "";
frmParameter.txtParam3.title = "";
} // End Function

btOK_Click(e){
// to record the changes
var r = null;

try{
// first we check if everything is OK
// the description
if(frmParameter.txtDescription.value == ""){
alert(tl("error_description"));
frmParameter.txtDescription.focus();
return;
} // End If
// the reference of the element
r = convertText2ReferenceObject(frmParameter.txtElementReference.value);
if(! r){
alert(tl("error_reference"));
frmParameter.txtElementReference.focus();
return;
} // End If
// the type of reference
if(frmParameter.cmbTypeReference.selectedIndex == -1){
alert(tl("error_type_reference"));
frmParameter.cmbTypeReference.focus();
return;
} // End If
// the action
if(frmParameter.cmbAction.value < 0){
alert(tl("error_action"));
frmParameter.cmbAction.focus();
return;
} // End If
// the additional parameters
if(frmParameter.txtParam1.style.display == "block"){
if(frmParameter.txtParam1.value == ""){
alert(tl("error_param"));
frmParameter.txtParam1.focus();
return;
} // End If
} // End If
if(frmParameter.txtParam2.style.display == "block"){
if(frmParameter.txtParam2.value == ""){
alert(tl("error_param"));
frmParameter.txtParam2.focus();
return;
} // End If
} // End If
if(frmParameter.txtParam3.style.display == "block"){
if(frmParameter.txtParam3.value == ""){
alert(tl("error_param"));
frmParameter.txtParam3.focus();
return;
} // End If
} // End If
if(frmParameter.cmbStyle.style.display == "block"){
if(frmParameter.txtParam1.value == ""){
alert(tl("error_style"));
frmParameter.cmbStyle.focus();
return;
} // End If
} // End If

// we transfer the values to the temporary parameter object
if(frmParameter.chkStatus.checked){
frmParameter.parameter.status = "1";
} else {
frmParameter.parameter.status = "0";
} // End If
frmParameter.parameter.description = frmParameter.txtDescription.value;
frmParameter.parameter.dateCreation = frmParameter.txtDateCreation.value;
frmParameter.parameter.elementReference = r;
frmParameter.parameter.typeReference = frmParameter.cmbTypeReference.value;
frmParameter.parameter.action = frmParameter.cmbAction.value;
frmParameter.parameter.param1 = frmParameter.txtParam1.value;
frmParameter.parameter.param2 = frmParameter.txtParam2.value;
frmParameter.parameter.param3 = frmParameter.txtParam3.value;

// then we record the changes in memory
if(frmParameter.parameterIndex == -1){
// it is a new parameter to add
// we are going to create its own index in the array of parameters
frmParameter.parameterIndex = accessibilityParameters.parameters.length;
} // End If
accessibilityParameters.parameters[frmParameter.parameterIndex] = frmParameter.parameter;

// we also record the changes in the local storage
saveAccessibilityParameters();

// and we close this form
frmParameter.hide();
frmAccessibility.show();
} catch(ex){
alert("Erreur " + ex.name + " ClFrmParameter btOK_Click- " + ex.message);
} // End Try
} // end function

btCancel_Click(e){
//
if(! frmParameter){
frmParameter = document.getElementById("frmParameter_yyd");
} // End If
frmParameter.hide();
if(! frmAccessibility){
frmAccessibility = document.getElementById("frmAccessibility_yyd");
} // End If
frmAccessibility.show();
} // end function

btCancel_KeyDown(e){
// when pressing on tab
// we move the focus to the first field of the form
// in order to make the navigation a cycle
if(e.keyCode == 9){ // tab
if(e.shiftKey==false && e.ctrlKey==false && e.altKey==false){
e.preventDefault();
frmParameter.txtDescription.focus();
return false;
} // End If
} // End If
} // End Function

show(parameterIndex=-1){
//
saystring(tl("frm_parameter_title"));
window.setTimeout(function(){
frmParameter.parameterIndex = parameterIndex;
if(parameterIndex == -1){
frmParameter.parameter = {};
frmParameter.parameter.id = getUniqIdentifier();
frmParameter.parameter.status = "1";
frmParameter.parameter.description = "";
frmParameter.parameter.dateCreation = getCurrentDate();
frmParameter.parameter.elementReference = getElementReference();
frmParameter.parameter.typeReference = "1";
frmParameter.parameter.action = "1";
frmParameter.parameter.param1 = "";
frmParameter.parameter.param2 = "";
frmParameter.parameter.param3 = "";
frmParameter.parameter.cmbStyle= "";
frmParameter.parameter.status = "1";
} else { // the parameter exists
frmParameter.parameter = accessibilityParameters.parameters[parameterIndex];
} // End If

// we send values to their respective fields
if(frmParameter.parameter.status == "1"){
frmParameter.chkStatus.checked = "checked";
} else {
frmParameter.chkStatus.checked = "";
} // End If
frmParameter.txtDescription.value = frmParameter.parameter.description;
frmParameter.txtDateCreation.value = frmParameter.parameter.dateCreation;
// special case for the reference
// we are going to convert the json object to an humanly understandable string
frmParameter.txtElementReference.value = convertReferenceObject2Text(frmParameter.parameter.elementReference);
// the type of reference
frmParameter.cmbTypeReference.value = frmParameter.parameter.typeReference;
if(! frmParameter.cmbTypeReference.value){
frmParameter.cmbTypeReference.value = "1";
} // End If
//
frmParameter.cmbAction.value = frmParameter.parameter.action;
frmParameter.txtParam1.value = frmParameter.parameter.param1;
frmParameter.txtParam2.value = frmParameter.parameter.param2;
frmParameter.txtParam3.value = frmParameter.parameter.param3;
if(frmParameter.cmbAction.value == "10"){
frmParameter.cmbStyle.value = frmParameter.txtParam1.value;
} else {
frmParameter.cmbStyle.value = "";
} // End If
// and we refresh the actions field
frmParameter.cmbAction_Change(null);

// we display the form
frmParameter.frm.style.display = "block";
// the focus on the creation date
frmParameter.txtDescription.focus();
saystring("Parameter form");
}, 1000);
} // end function

hide(){
// hide the form
this.frm.style.display = "none";
} // End Function

} // end class

// we initialize the saystring function
saystring("");

// we add the keydown event
window.addEventListener('keydown', onPageKeyDown, true);
// we add the onload event
document.getElementsByTagName("body")[0].addEventListener("load", onPageLoad, true);
// we add the mouseMove event
document.addEventListener('mousemove', onPageMouseMove, false);
// we add the structure change event
// DOMSubtreeModified
// document.addEventListener('DOMSubtreeModified', onPageStructureChange, false);

// for security
// we schedule the loading if it's not triggered normally
window.setTimeout(function () {
if(isStarted == false){
onPageLoad();
} // End If
}, 5000);

// enumeration of color code associations

// in english
var tColors_en = [{"code":"255250250", "name":"snow"}, {"code":"248248255", "name":"ghost white"}, {"code":"245245245", "name":"white smoke"}, {"code":"220220220", "name":"gainsboro"}, {"code":"255250240", "name":"floral white"}, {"code":"253245230", "name":"old lace"}, {"code":"250240230", "name":"linen"}, {"code":"250235215", "name":"antique white"}, {"code":"255239213", "name":"papaya whip"}, {"code":"255235205", "name":"blanched almond"}, {"code":"255228196", "name":"bisque"}, {"code":"255218185", "name":"peach puff"}, {"code":"255222173", "name":"navajo white"}, {"code":"255228181", "name":"moccasin"}, {"code":"255248220", "name":"cornsilk"}, {"code":"255255240", "name":"ivory"}, {"code":"255250205", "name":"lemon chiffon"}, {"code":"255245238", "name":"seashell"}, {"code":"240255240", "name":"honeydew"}, {"code":"245255250", "name":"mint cream"}, {"code":"240255255", "name":"azure"}, {"code":"240248255", "name":"alice blue"}, {"code":"230230250", "name":"lavender"}, {"code":"255240245", "name":"lavender blush"}, {"code":"255228225", "name":"misty rose"}, {"code":"255255255", "name":"white"}, {"code":"000000000", "name":"black"}, {"code":"047079079", "name":"dark slate gray"}, {"code":"105105105", "name":"dim gray"}, {"code":"112128144", "name":"slate gray"}, {"code":"119136153", "name":"light slate gray"}, {"code":"128128128", "name":"gray"}, {"code":"211211211", "name":"light grey"}, {"code":"025025112", "name":"midnight blue"}, {"code":"000000128", "name":"navy"}, {"code":"100149237", "name":"cornflower blue"}, {"code":"072061139", "name":"dark slate blue"}, {"code":"106090205", "name":"slate blue"}, {"code":"123104238", "name":"medium slate blue"}, {"code":"132112255", "name":"light slate blue"}, {"code":"000000205", "name":"medium blue"}, {"code":"065105225", "name":"royal blue"}, {"code":"000000255", "name":"blue"}, {"code":"030144255", "name":"dodger blue"}, {"code":"000191255", "name":"deep sky blue"}, {"code":"135206235", "name":"sky blue"}, {"code":"135206250", "name":"light sky blue"}, {"code":"070130180", "name":"steel blue"}, {"code":"176196222", "name":"light steel blue"}, {"code":"173216230", "name":"light blue"}, {"code":"176224230", "name":"powder blue"}, {"code":"175238238", "name":"pale turquoise"}, {"code":"000206209", "name":"dark turquoise"}, {"code":"072209204", "name":"medium turquoise"}, {"code":"064224208", "name":"turquoise"}, {"code":"224255255", "name":"light cyan"}, {"code":"095158160", "name":"cadet blue"}, {"code":"102205170", "name":"medium aquamarine"}, {"code":"127255212", "name":"aquamarine"}, {"code":"000100000", "name":"dark green"}, {"code":"085107047", "name":"dark olive green"}, {"code":"143188143", "name":"dark sea green"}, {"code":"046139087", "name":"sea green"}, {"code":"060179113", "name":"medium sea green"}, {"code":"032178170", "name":"light sea green"}, {"code":"152251152", "name":"pale green"}, {"code":"000255127", "name":"spring green"}, {"code":"124252000", "name":"lawn green"}, {"code":"000255000", "name":"green"}, {"code":"127255000", "name":"chartreuse"}, {"code":"000250154", "name":"medium spring green"}, {"code":"173255047", "name":"green yellow"}, {"code":"050205050", "name":"lime green"}, {"code":"154205050", "name":"yellow green"}, {"code":"034139034", "name":"forest green"}, {"code":"107142035", "name":"olive drab"}, {"code":"189183107", "name":"dark khaki"}, {"code":"240230140", "name":"khaki"}, {"code":"238232170", "name":"pale goldenrod"}, {"code":"250250210", "name":"light goldenrod yellow"}, {"code":"255255224", "name":"light yellow"}, {"code":"255255000", "name":"yellow"}, {"code":"255215000", "name":"gold"}, {"code":"255204000", "name":"gold"}, {"code":"238221130", "name":"light goldenrod"}, {"code":"218165032", "name":"goldenrod"}, {"code":"184134011", "name":"dark goldenrod"}, {"code":"188143143", "name":"rosy brown"}, {"code":"205092092", "name":"indian red"}, {"code":"139069019", "name":"saddle brown"}, {"code":"160082045", "name":"sienna"}, {"code":"205133063", "name":"peru"}, {"code":"222184135", "name":"burlywood"}, {"code":"245245220", "name":"beige"}, {"code":"245222179", "name":"wheat"}, {"code":"244164096", "name":"sandy brown"}, {"code":"210180140", "name":"tan"}, {"code":"210105030", "name":"chocolate"}, {"code":"178034034", "name":"firebrick"}, {"code":"165042042", "name":"brown"}, {"code":"233150122", "name":"dark salmon"}, {"code":"250128114", "name":"salmon"}, {"code":"255160122", "name":"light salmon"}, {"code":"255165000", "name":"orange"}, {"code":"255140000", "name":"dark orange"}, {"code":"255127080", "name":"coral"}, {"code":"240128128", "name":"light coral"}, {"code":"255099071", "name":"tomato"}, {"code":"255069000", "name":"orange red"}, {"code":"255000000", "name":"red"}, {"code":"255105180", "name":"hot pink"}, {"code":"255020147", "name":"deep pink"}, {"code":"255192203", "name":"pink"}, {"code":"255182193", "name":"light pink"}, {"code":"219112147", "name":"pale violet red"}, {"code":"176048096", "name":"maroon"}, {"code":"199021133", "name":"medium violet red"}, {"code":"208032144", "name":"violet red"}, {"code":"255000255", "name":"magenta"}, {"code":"238130238", "name":"violet"}, {"code":"221160221", "name":"plum"}, {"code":"218112214", "name":"orchid"}, {"code":"186085211", "name":"medium orchid"}, {"code":"153050204", "name":"dark orchid"}, {"code":"148000211", "name":"dark violet"}, {"code":"138043226", "name":"blue violet"}, {"code":"160032240", "name":"purple"}, {"code":"147112219", "name":"medium purple"}, {"code":"216191216", "name":"thistle"}, {"code":"238233233", "name":"snow2"}, {"code":"205201201", "name":"snow3"}, {"code":"139137137", "name":"snow4"}, {"code":"238229222", "name":"seashell2"}, {"code":"205197191", "name":"seashell3"}, {"code":"139134130", "name":"seashell4"}, {"code":"255239219", "name":"AntiqueWhite1"}, {"code":"238223204", "name":"AntiqueWhite2"}, {"code":"205192176", "name":"AntiqueWhite3"}, {"code":"139131120", "name":"AntiqueWhite4"}, {"code":"238213183", "name":"bisque2"}, {"code":"205183158", "name":"bisque3"}, {"code":"139125107", "name":"bisque4"}, {"code":"238203173", "name":"PeachPuff2"}, {"code":"205175149", "name":"PeachPuff3"}, {"code":"139119101", "name":"PeachPuff4"}, {"code":"238207161", "name":"NavajoWhite2"}, {"code":"205179139", "name":"NavajoWhite3"}, {"code":"139121094", "name":"NavajoWhite4"}, {"code":"238233191", "name":"LemonChiffon2"}, {"code":"205201165", "name":"LemonChiffon3"}, {"code":"139137112", "name":"LemonChiffon4"}, {"code":"238232205", "name":"cornsilk2"}, {"code":"205200177", "name":"cornsilk3"}, {"code":"139136120", "name":"cornsilk4"}, {"code":"238238224", "name":"ivory2"}, {"code":"205205193", "name":"ivory3"}, {"code":"139139131", "name":"ivory4"}, {"code":"224238224", "name":"honeydew2"}, {"code":"193205193", "name":"honeydew3"}, {"code":"131139131", "name":"honeydew4"}, {"code":"238224229", "name":"LavenderBlush2"}, {"code":"205193197", "name":"LavenderBlush3"}, {"code":"139131134", "name":"LavenderBlush4"}, {"code":"238213210", "name":"MistyRose2"}, {"code":"205183181", "name":"MistyRose3"}, {"code":"139125123", "name":"MistyRose4"}, {"code":"224238238", "name":"azure2"}, {"code":"193205205", "name":"azure3"}, {"code":"131139139", "name":"azure4"}, {"code":"131111255", "name":"SlateBlue1"}, {"code":"122103238", "name":"SlateBlue2"}, {"code":"105089205", "name":"SlateBlue3"}, {"code":"071060139", "name":"SlateBlue4"}, {"code":"072118255", "name":"RoyalBlue1"}, {"code":"067110238", "name":"RoyalBlue2"}, {"code":"058095205", "name":"RoyalBlue3"}, {"code":"039064139", "name":"RoyalBlue4"}, {"code":"000000238", "name":"blue2"}, {"code":"000000139", "name":"blue4"}, {"code":"028134238", "name":"DodgerBlue2"}, {"code":"024116205", "name":"DodgerBlue3"}, {"code":"016078139", "name":"DodgerBlue4"}, {"code":"099184255", "name":"SteelBlue1"}, {"code":"092172238", "name":"SteelBlue2"}, {"code":"079148205", "name":"SteelBlue3"}, {"code":"054100139", "name":"SteelBlue4"}, {"code":"000178238", "name":"DeepSkyBlue2"}, {"code":"000154205", "name":"DeepSkyBlue3"}, {"code":"000104139", "name":"DeepSkyBlue4"}, {"code":"135206255", "name":"SkyBlue1"}, {"code":"126192238", "name":"SkyBlue2"}, {"code":"108166205", "name":"SkyBlue3"}, {"code":"074112139", "name":"SkyBlue4"}, {"code":"176226255", "name":"LightSkyBlue1"}, {"code":"164211238", "name":"LightSkyBlue2"}, {"code":"141182205", "name":"LightSkyBlue3"}, {"code":"096123139", "name":"LightSkyBlue4"}, {"code":"198226255", "name":"SlateGray1"}, {"code":"185211238", "name":"SlateGray2"}, {"code":"159182205", "name":"SlateGray3"}, {"code":"108123139", "name":"SlateGray4"}, {"code":"202225255", "name":"LightSteelBlue1"}, {"code":"188210238", "name":"LightSteelBlue2"}, {"code":"162181205", "name":"LightSteelBlue3"}, {"code":"110123139", "name":"LightSteelBlue4"}, {"code":"191239255", "name":"LightBlue1"}, {"code":"178223238", "name":"LightBlue2"}, {"code":"154192205", "name":"LightBlue3"}, {"code":"104131139", "name":"LightBlue4"}, {"code":"209238238", "name":"LightCyan2"}, {"code":"180205205", "name":"LightCyan3"}, {"code":"122139139", "name":"LightCyan4"}, {"code":"187255255", "name":"PaleTurquoise1"}, {"code":"174238238", "name":"PaleTurquoise2"}, {"code":"150205205", "name":"PaleTurquoise3"}, {"code":"102139139", "name":"PaleTurquoise4"}, {"code":"152245255", "name":"CadetBlue1"}, {"code":"142229238", "name":"CadetBlue2"}, {"code":"122197205", "name":"CadetBlue3"}, {"code":"083134139", "name":"CadetBlue4"}, {"code":"000245255", "name":"turquoise1"}, {"code":"000229238", "name":"turquoise2"}, {"code":"000197205", "name":"turquoise3"}, {"code":"000134139", "name":"turquoise4"}, {"code":"000255255", "name":"cyan"}, {"code":"000238238", "name":"cyan2"}, {"code":"000205205", "name":"cyan3"}, {"code":"000139139", "name":"cyan4"}, {"code":"151255255", "name":"Dark Gray"}, {"code":"141238238", "name":"DarkSlateGray2"}, {"code":"121205205", "name":"DarkSlateGray3"}, {"code":"082139139", "name":"DarkSlateGray4"}, {"code":"118238198", "name":"aquamarine2"}, {"code":"069139116", "name":"aquamarine4"}, {"code":"193255193", "name":"DarkSeaGreen1"}, {"code":"180238180", "name":"DarkSeaGreen2"}, {"code":"155205155", "name":"DarkSeaGreen3"}, {"code":"105139105", "name":"DarkSeaGreen4"}, {"code":"084255159", "name":"SeaGreen1"}, {"code":"078238148", "name":"SeaGreen2"}, {"code":"067205128", "name":"SeaGreen3"}, {"code":"154255154", "name":"PaleGreen1"}, {"code":"144238144", "name":"PaleGreen2"}, {"code":"124205124", "name":"PaleGreen3"}, {"code":"084139084", "name":"PaleGreen4"}, {"code":"000238118", "name":"SpringGreen2"}, {"code":"000205102", "name":"SpringGreen3"}, {"code":"000139069", "name":"SpringGreen4"}, {"code":"000238000", "name":"green2"}, {"code":"000205000", "name":"green3"}, {"code":"000139000", "name":"green4"}, {"code":"118238000", "name":"chartreuse2"}, {"code":"102205000", "name":"chartreuse3"}, {"code":"069139000", "name":"chartreuse4"}, {"code":"192255062", "name":"OliveDrab1"}, {"code":"179238058", "name":"OliveDrab2"}, {"code":"105139034", "name":"OliveDrab4"}, {"code":"202255112", "name":"DarkOliveGreen1"}, {"code":"188238104", "name":"DarkOliveGreen2"}, {"code":"162205090", "name":"DarkOliveGreen3"}, {"code":"110139061", "name":"DarkOliveGreen4"}, {"code":"255246143", "name":"khaki1"}, {"code":"238230133", "name":"khaki2"}, {"code":"205198115", "name":"khaki3"}, {"code":"139134078", "name":"khaki4"}, {"code":"255236139", "name":"LightGoldenrod1"}, {"code":"238220130", "name":"LightGoldenrod2"}, {"code":"205190112", "name":"LightGoldenrod3"}, {"code":"139129076", "name":"LightGoldenrod4"}, {"code":"238238209", "name":"LightYellow2"}, {"code":"205205180", "name":"LightYellow3"}, {"code":"139139122", "name":"LightYellow4"}, {"code":"238238000", "name":"yellow2"}, {"code":"205205000", "name":"yellow3"}, {"code":"139139000", "name":"yellow4"}, {"code":"238201000", "name":"gold2"}, {"code":"205173000", "name":"gold3"}, {"code":"139117000", "name":"gold4"}, {"code":"255193037", "name":"goldenrod1"}, {"code":"238180034", "name":"goldenrod2"}, {"code":"205155029", "name":"goldenrod3"}, {"code":"139105020", "name":"goldenrod4"}, {"code":"255185015", "name":"DarkGoldenrod1"}, {"code":"238173014", "name":"DarkGoldenrod2"}, {"code":"205149012", "name":"DarkGoldenrod3"}, {"code":"139101008", "name":"DarkGoldenrod4"}, {"code":"255193193", "name":"RosyBrown1"}, {"code":"238180180", "name":"RosyBrown2"}, {"code":"205155155", "name":"RosyBrown3"}, {"code":"139105105", "name":"RosyBrown4"}, {"code":"255106106", "name":"IndianRed1"}, {"code":"238099099", "name":"IndianRed2"}, {"code":"205085085", "name":"IndianRed3"}, {"code":"139058058", "name":"IndianRed4"}, {"code":"255130071", "name":"sienna1"}, {"code":"238121066", "name":"sienna2"}, {"code":"205104057", "name":"sienna3"}, {"code":"139071038", "name":"sienna4"}, {"code":"255211155", "name":"burlywood1"}, {"code":"238197145", "name":"burlywood2"}, {"code":"205170125", "name":"burlywood3"}, {"code":"139115085", "name":"burlywood4"}, {"code":"255231186", "name":"wheat1"}, {"code":"238216174", "name":"wheat2"}, {"code":"205186150", "name":"wheat3"}, {"code":"139126102", "name":"wheat4"}, {"code":"255165079", "name":"tan1"}, {"code":"238154073", "name":"tan2"}, {"code":"139090043", "name":"tan4"}, {"code":"255127036", "name":"chocolate1"}, {"code":"238118033", "name":"chocolate2"}, {"code":"205102029", "name":"chocolate3"}, {"code":"255048048", "name":"firebrick1"}, {"code":"238044044", "name":"firebrick2"}, {"code":"205038038", "name":"firebrick3"}, {"code":"139026026", "name":"firebrick4"}, {"code":"255064064", "name":"brown1"}, {"code":"238059059", "name":"brown2"}, {"code":"205051051", "name":"brown3"}, {"code":"139035035", "name":"brown4"}, {"code":"255140105", "name":"salmon1"}, {"code":"238130098", "name":"salmon2"}, {"code":"205112084", "name":"salmon3"}, {"code":"139076057", "name":"salmon4"}, {"code":"238149114", "name":"LightSalmon2"}, {"code":"205129098", "name":"LightSalmon3"}, {"code":"139087066", "name":"LightSalmon4"}, {"code":"238154000", "name":"orange2"}, {"code":"205133000", "name":"orange3"}, {"code":"139090000", "name":"orange4"}, {"code":"255127000", "name":"DarkOrange1"}, {"code":"238118000", "name":"DarkOrange2"}, {"code":"205102000", "name":"DarkOrange3"}, {"code":"139069000", "name":"DarkOrange4"}, {"code":"255114086", "name":"coral1"}, {"code":"238106080", "name":"coral2"}, {"code":"205091069", "name":"coral3"}, {"code":"139062047", "name":"coral4"}, {"code":"238092066", "name":"tomato2"}, {"code":"205079057", "name":"tomato3"}, {"code":"139054038", "name":"tomato4"}, {"code":"238064000", "name":"OrangeRed2"}, {"code":"205055000", "name":"OrangeRed3"}, {"code":"139037000", "name":"OrangeRed4"}, {"code":"238000000", "name":"red2"}, {"code":"205000000", "name":"red3"}, {"code":"139000000", "name":"red4"}, {"code":"238018137", "name":"DeepPink2"}, {"code":"205016118", "name":"DeepPink3"}, {"code":"139010080", "name":"DeepPink4"}, {"code":"255110180", "name":"HotPink1"}, {"code":"238106167", "name":"HotPink2"}, {"code":"205096144", "name":"HotPink3"}, {"code":"139058098", "name":"HotPink4"}, {"code":"255181197", "name":"pink1"}, {"code":"238169184", "name":"pink2"}, {"code":"205145158", "name":"pink3"}, {"code":"139099108", "name":"pink4"}, {"code":"255174185", "name":"LightPink1"}, {"code":"238162173", "name":"LightPink2"}, {"code":"205140149", "name":"LightPink3"}, {"code":"139095101", "name":"LightPink4"}, {"code":"255130171", "name":"PaleVioletRed1"}, {"code":"238121159", "name":"PaleVioletRed2"}, {"code":"205104137", "name":"PaleVioletRed3"}, {"code":"139071093", "name":"PaleVioletRed4"}, {"code":"255052179", "name":"maroon1"}, {"code":"238048167", "name":"maroon2"}, {"code":"205041144", "name":"maroon3"}, {"code":"139028098", "name":"maroon4"}, {"code":"255062150", "name":"VioletRed1"}, {"code":"238058140", "name":"VioletRed2"}, {"code":"205050120", "name":"VioletRed3"}, {"code":"139034082", "name":"VioletRed4"}, {"code":"238000238", "name":"magenta2"}, {"code":"205000205", "name":"magenta3"}, {"code":"139000139", "name":"magenta4"}, {"code":"255131250", "name":"orchid1"}, {"code":"238122233", "name":"orchid2"}, {"code":"205105201", "name":"orchid3"}, {"code":"139071137", "name":"orchid4"}, {"code":"255187255", "name":"plum1"}, {"code":"238174238", "name":"plum2"}, {"code":"205150205", "name":"plum3"}, {"code":"139102139", "name":"plum4"}, {"code":"224102255", "name":"MediumOrchid1"}, {"code":"209095238", "name":"MediumOrchid2"}, {"code":"180082205", "name":"MediumOrchid3"}, {"code":"122055139", "name":"MediumOrchid4"}, {"code":"191062255", "name":"DarkOrchid1"}, {"code":"178058238", "name":"DarkOrchid2"}, {"code":"154050205", "name":"DarkOrchid3"}, {"code":"104034139", "name":"DarkOrchid4"}, {"code":"155048255", "name":"purple1"}, {"code":"145044238", "name":"purple2"}, {"code":"125038205", "name":"purple3"}, {"code":"085026139", "name":"purple4"}, {"code":"171130255", "name":"MediumPurple1"}, {"code":"159121238", "name":"MediumPurple2"}, {"code":"137104205", "name":"MediumPurple3"}, {"code":"093071139", "name":"MediumPurple4"}, {"code":"255225255", "name":"thistle1"}, {"code":"238210238", "name":"thistle2"}, {"code":"205181205", "name":"thistle3"}, {"code":"139123139", "name":"thistle4"}, {"code":"003003003", "name":"gray1"}, {"code":"005005005", "name":"gray2"}, {"code":"008008008", "name":"gray3"}, {"code":"010010010", "name":"gray4"}, {"code":"013013013", "name":"gray5"}, {"code":"015015015", "name":"gray6"}, {"code":"018018018", "name":"gray7"}, {"code":"020020020", "name":"gray8"}, {"code":"023023023", "name":"gray9"}, {"code":"026026026", "name":"gray10"}, {"code":"028028028", "name":"gray11"}, {"code":"031031031", "name":"gray12"}, {"code":"033033033", "name":"gray13"}, {"code":"036036036", "name":"gray14"}, {"code":"038038038", "name":"gray15"}, {"code":"041041041", "name":"gray16"}, {"code":"043043043", "name":"gray17"}, {"code":"046046046", "name":"gray18"}, {"code":"048048048", "name":"gray19"}, {"code":"051051051", "name":"gray20"}, {"code":"054054054", "name":"gray21"}, {"code":"056056056", "name":"gray22"}, {"code":"059059059", "name":"gray23"}, {"code":"061061061", "name":"gray24"}, {"code":"064064064", "name":"gray25"}, {"code":"066066066", "name":"gray26"}, {"code":"069069069", "name":"gray27"}, {"code":"071071071", "name":"gray28"}, {"code":"074074074", "name":"gray29"}, {"code":"077077077", "name":"gray30"}, {"code":"079079079", "name":"gray31"}, {"code":"082082082", "name":"gray32"}, {"code":"084084084", "name":"gray33"}, {"code":"087087087", "name":"gray34"}, {"code":"089089089", "name":"gray35"}, {"code":"092092092", "name":"gray36"}, {"code":"094094094", "name":"gray37"}, {"code":"097097097", "name":"gray38"}, {"code":"099099099", "name":"gray39"}, {"code":"102102102", "name":"gray40"}, {"code":"107107107", "name":"gray42"}, {"code":"110110110", "name":"gray43"}, {"code":"112112112", "name":"gray44"}, {"code":"115115115", "name":"gray45"}, {"code":"117117117", "name":"gray46"}, {"code":"120120120", "name":"gray47"}, {"code":"122122122", "name":"gray48"}, {"code":"125125125", "name":"gray49"}, {"code":"127127127", "name":"gray50"}, {"code":"130130130", "name":"gray51"}, {"code":"133133133", "name":"gray52"}, {"code":"135135135", "name":"gray53"}, {"code":"138138138", "name":"gray54"}, {"code":"140140140", "name":"gray55"}, {"code":"143143143", "name":"gray56"}, {"code":"145145145", "name":"gray57"}, {"code":"148148148", "name":"gray58"}, {"code":"150150150", "name":"gray59"}, {"code":"153153153", "name":"gray60"}, {"code":"156156156", "name":"gray61"}, {"code":"158158158", "name":"gray62"}, {"code":"161161161", "name":"gray63"}, {"code":"163163163", "name":"gray64"}, {"code":"166166166", "name":"gray65"}, {"code":"168168168", "name":"gray66"}, {"code":"171171171", "name":"gray67"}, {"code":"173173173", "name":"gray68"}, {"code":"176176176", "name":"gray69"}, {"code":"179179179", "name":"gray70"}, {"code":"181181181", "name":"gray71"}, {"code":"184184184", "name":"gray72"}, {"code":"186186186", "name":"gray73"}, {"code":"189189189", "name":"gray74"}, {"code":"191191191", "name":"gray75"}, {"code":"194194194", "name":"gray76"}, {"code":"196196196", "name":"gray77"}, {"code":"199199199", "name":"gray78"}, {"code":"201201201", "name":"gray79"}, {"code":"204204204", "name":"gray80"}, {"code":"207207207", "name":"gray81"}, {"code":"209209209", "name":"gray82"}, {"code":"212212212", "name":"gray83"}, {"code":"214214214", "name":"gray84"}, {"code":"217217217", "name":"gray85"}, {"code":"219219219", "name":"gray86"}, {"code":"222222222", "name":"gray87"}, {"code":"224224224", "name":"gray88"}, {"code":"227227227", "name":"gray89"}, {"code":"229229229", "name":"gray90"}, {"code":"232232232", "name":"gray91"}, {"code":"235235235", "name":"gray92"}, {"code":"237237237", "name":"gray93"}, {"code":"240240240", "name":"gray94"}, {"code":"242242242", "name":"gray95"}, {"code":"247247247", "name":"gray97"}, {"code":"250250250", "name":"gray98"}, {"code":"252252252", "name":"gray99"}, {"code":"000128000", "name":"lime green 2"}, {"code":"AliceBlue", "name":"#F0F8FF"}, {"code":"burlywood", "name":"#DEB887"}, {"code":"CadetBlue", "name":"#5F9EA0"}, {"code":"chocolate", "name":"#D2691E"}, {"code":"DarkGreen", "name":"#006400"}, {"code":"DarkKhaki", "name":"#BDB76B"}, {"code":"FireBrick", "name":"#B22222"}, {"code":"gainsboro", "name":"#DCDCDC"}, {"code":"GoldEnrod", "name":"#DAA520"}, {"code":"IndianRed", "name":"#CD5C5C"}, {"code":"LawnGreen", "name":"#7CFC00"}, {"code":"LightBlue", "name":"#ADD8E6"}, {"code":"LightCyan", "name":"#E0FFFF"}, {"code":"LightGrey", "name":"#D3D3D3"}, {"code":"LightPink", "name":"#FFB6C1"}, {"code":"limeGreen", "name":"#32CD32"}, {"code":"MintCream", "name":"#F5FFFA"}, {"code":"mistyrose", "name":"#FFE4E1"}, {"code":"OliveDrab", "name":"#6B8E23"}, {"code":"OrangeRed", "name":"#FF4500"}, {"code":"PaleGreen", "name":"#98FB98"}, {"code":"PeachPuff", "name":"#FFDAB9"}, {"code":"RosyBrown", "name":"#BC8F8F"}, {"code":"RoyalBlue", "name":"#4169E1"}, {"code":"SlateBlue", "name":"#6A5ACD"}, {"code":"SlateGray", "name":"#708090"}, {"code":"SteelBlue", "name":"#4682B4"}, {"code":"turquoise", "name":"#40E0D0"}];

// in french
var tColors_fr = [{"code":"255250250", "name":"BlancNeigeux"}, {"code":"248248255", "name":"BlancSpectral"}, {"code":"245245245", "name":"BlancFumée"}, {"code":"220220220", "name":"gainsboro"}, {"code":"255250240", "name":"BlancFloral"}, {"code":"253245230", "name":"VieuxBlanc"}, {"code":"250240230", "name":"BlancDeLin"}, {"code":"250235215", "name":"BlancAntique "}, {"code":"255239213", "name":"PapayeDélavé"}, {"code":"255235205", "name":"AmandeBlanchi"}, {"code":"255228196", "name":"Bisque"}, {"code":"255218185", "name":"PêchePassé"}, {"code":"255222173", "name":"BlancNavarro"}, {"code":"255228181", "name":"BeigeMoccassin"}, {"code":"255248220", "name":"JauneMaïsDoux"}, {"code":"255255240", "name":"Ivoire"}, {"code":"255250205", "name":"JauneChiffoné"}, {"code":"255245238", "name":"Coquillage"}, {"code":"240255240", "name":"Miellé"}, {"code":"245255250", "name":"BlancMentholé"}, {"code":"240255255", "name":"Azurin"}, {"code":"240248255", "name":"BleuAlice"}, {"code":"230230250", "name":"Lavande"}, {"code":"255240245", "name":"LavandeRougeâtre"}, {"code":"255228225", "name":"RoseVoilé"}, {"code":"255255255", "name":"Blanc"}, {"code":"000000000", "name":"Noir"}, {"code":"047079079", "name":"GrisArdoiseSombre"}, {"code":"105105105", "name":"GrisRabattu"}, {"code":"112128144", "name":"GrisArdoise"}, {"code":"119136153", "name":"GrisArdoiseClair"}, {"code":"128128128", "name":"gris"}, {"code":"211211211", "name":"GrisClair"}, {"code":"025025112", "name":"BleuNuit"}, {"code":"000000128", "name":"BleuMarine"}, {"code":"100149237", "name":"Bleuet"}, {"code":"072061139", "name":"BleuArdoiseSombre"}, {"code":"106090205", "name":"BleuArdoise"}, {"code":"123104238", "name":"BleuArdoiseMoyen"}, {"code":"132112255", "name":"BleuArdoiseClair"}, {"code":"000000205", "name":"BleuMoyen"}, {"code":"065105225", "name":"BleuRoi"}, {"code":"000000255", "name":"Bleu"}, {"code":"030144255", "name":"DodgerBlue"}, {"code":"000191255", "name":"BleuCielProfond"}, {"code":"135206235", "name":"BleuCiel"}, {"code":"135206250", "name":"BleuCielClair"}, {"code":"070130180", "name":"BleuAcier"}, {"code":"176196222", "name":"BleuAcierClair"}, {"code":"173216230", "name":"BleuClair"}, {"code":"176224230", "name":"BleuPoudré"}, {"code":"175238238", "name":"TurquoisePâle"}, {"code":"000206209", "name":"TurquoiseSombre"}, {"code":"072209204", "name":"TurquoiseMoyen"}, {"code":"064224208", "name":"Turquoise"}, {"code":"224255255", "name":"CyanClair"}, {"code":"095158160", "name":"PétroleClair"}, {"code":"102205170", "name":"Aigue-marineMoyen"}, {"code":"127255212", "name":"Aigue-marine"}, {"code":"000100000", "name":"VertSombre"}, {"code":"085107047", "name":"VertOliveSombre"}, {"code":"143188143", "name":"VertOcéanSombre"}, {"code":"046139087", "name":"VertOcéan"}, {"code":"060179113", "name":"VertOcéanMoyen"}, {"code":"032178170", "name":"VertOcéanClair"}, {"code":"152251152", "name":"VertPâle"}, {"code":"000255127", "name":"VertPrintemps"}, {"code":"124252000", "name":"VertPrairie"}, {"code":"000255000", "name":"Vert"}, {"code":"127255000", "name":"VertChartreuse"}, {"code":"000250154", "name":"VertPrintempsMoyen"}, {"code":"173255047", "name":"JauneVert"}, {"code":"050205050", "name":"CitronVertFoncé"}, {"code":"154205050", "name":"VertJaunâtre"}, {"code":"034139034", "name":"VertForêt"}, {"code":"107142035", "name":"VertOliveTerne"}, {"code":"189183107", "name":"KakiSombre"}, {"code":"240230140", "name":"Kaki"}, {"code":"238232170", "name":"JaunePaillePâle"}, {"code":"250250210", "name":"JaunePailleClair"}, {"code":"255255224", "name":"JauneClair"}, {"code":"255255000", "name":"Jaune"}, {"code":"255215000", "name":"Or"}, {"code":"255204000", "name":"Or"}, {"code":"238221130", "name":"JaunePailleClair"}, {"code":"218165032", "name":"JaunePaille"}, {"code":"184134011", "name":"JaunePailleSombre"}, {"code":"188143143", "name":"BoisDeRose"}, {"code":"205092092", "name":"RougeIndien"}, {"code":"139069019", "name":"Cuir"}, {"code":"160082045", "name":"TerreDeSienne"}, {"code":"205133063", "name":"Pérou"}, {"code":"222184135", "name":"BoisDur"}, {"code":"245245220", "name":"Beige"}, {"code":"245222179", "name":"Blé"}, {"code":"244164096", "name":"BrunSable"}, {"code":"210180140", "name":"BrunTané"}, {"code":"210105030", "name":"Chocolat"}, {"code":"178034034", "name":"RougeBrique"}, {"code":"165042042", "name":"Brun"}, {"code":"233150122", "name":"SaumonSombre"}, {"code":"250128114", "name":"Saumon"}, {"code":"255160122", "name":"SaumonClair"}, {"code":"255165000", "name":"Orange"}, {"code":"255140000", "name":"OrangeSombre"}, {"code":"255127080", "name":"Corail"}, {"code":"240128128", "name":"CorailClair"}, {"code":"255099071", "name":"RougeTomate"}, {"code":"255069000", "name":"RougeOrangé"}, {"code":"255000000", "name":"Rouge"}, {"code":"255105180", "name":"RoseChaud"}, {"code":"255020147", "name":"RoseProfond"}, {"code":"255192203", "name":"Rose"}, {"code":"255182193", "name":"RoseClair"}, {"code":"219112147", "name":"RougeViolacéPâle"}, {"code":"176048096", "name":"Marron"}, {"code":"199021133", "name":"RougeViolacéMoyen"}, {"code":"208032144", "name":"RougeViolacé"}, {"code":"255000255", "name":"Magenta"}, {"code":"238130238", "name":"Parme"}, {"code":"221160221", "name":"Prune"}, {"code":"218112214", "name":"Orchidée"}, {"code":"186085211", "name":"OrchidéeMoyen"}, {"code":"153050204", "name":"OrchidéeSombre"}, {"code":"148000211", "name":"ParmeSombre"}, {"code":"138043226", "name":"ParmeBleuté"}, {"code":"160032240", "name":"Violet"}, {"code":"147112219", "name":"VioletMoyen"}, {"code":"216191216", "name":"Chardon"}, {"code":"238233233", "name":"BlancNeigeux2"}, {"code":"205201201", "name":"BlancNeigeux3"}, {"code":"139137137", "name":"BlancNeigeux4"}, {"code":"238229222", "name":"Coquillage2"}, {"code":"205197191", "name":"Coquillage3"}, {"code":"139134130", "name":"Coquillage4"}, {"code":"255239219", "name":"BlancAntique1"}, {"code":"238223204", "name":"BlancAntique2"}, {"code":"205192176", "name":"BlancAntique3"}, {"code":"139131120", "name":"BlancAntique4"}, {"code":"238213183", "name":"Bisque2"}, {"code":"205183158", "name":"Bisque3"}, {"code":"139125107", "name":"Bisque4"}, {"code":"238203173", "name":"PêchePassé2"}, {"code":"205175149", "name":"PêchePassé3"}, {"code":"139119101", "name":"PêchePassé4"}, {"code":"238207161", "name":"BlancNavarro2"}, {"code":"205179139", "name":"BlancNavarro3"}, {"code":"139121094", "name":"BlancNavarro4"}, {"code":"238233191", "name":"JauneChiffoné2"}, {"code":"205201165", "name":"JauneChiffoné3"}, {"code":"139137112", "name":"JauneChiffoné4"}, {"code":"238232205", "name":"JauneMaïsDoux2"}, {"code":"205200177", "name":"JauneMaïsDoux3"}, {"code":"139136120", "name":"JauneMaïsDoux4"}, {"code":"238238224", "name":"Ivoire2"}, {"code":"205205193", "name":"Ivoire3"}, {"code":"139139131", "name":"Ivoire4"}, {"code":"224238224", "name":"Miellé2"}, {"code":"193205193", "name":"Miellé3"}, {"code":"131139131", "name":"Miellé4"}, {"code":"238224229", "name":"LavandeRougeâtre2"}, {"code":"205193197", "name":"LavandeRougeâtre3"}, {"code":"139131134", "name":"LavandeRougeâtre4"}, {"code":"238213210", "name":"RoseVoilé2"}, {"code":"205183181", "name":"RoseVoilé3"}, {"code":"139125123", "name":"RoseVoilé4"}, {"code":"224238238", "name":"Azurin2"}, {"code":"193205205", "name":"Azurin3"}, {"code":"131139139", "name":"Azurin4"}, {"code":"131111255", "name":"BleuArdoise1"}, {"code":"122103238", "name":"BleuArdoise2"}, {"code":"105089205", "name":"BleuArdoise3"}, {"code":"071060139", "name":"BleuArdoise4"}, {"code":"072118255", "name":"BleuRoi1"}, {"code":"067110238", "name":"BleuRoi2"}, {"code":"058095205", "name":"BleuRoi3"}, {"code":"039064139", "name":"BleuRoi4"}, {"code":"000000238", "name":"Bleu2"}, {"code":"000000139", "name":"Bleu4"}, {"code":"028134238", "name":"DodgerBlue2"}, {"code":"024116205", "name":"DodgerBlue3"}, {"code":"016078139", "name":"DodgerBlue4"}, {"code":"099184255", "name":"BleuMétal1"}, {"code":"092172238", "name":"BleuMétal2"}, {"code":"079148205", "name":"BleuMétal3"}, {"code":"054100139", "name":"BleuMétal4"}, {"code":"000178238", "name":"BleuCielProfond2"}, {"code":"000154205", "name":"BleuCielProfond3"}, {"code":"000104139", "name":"BleuCielProfond4"}, {"code":"135206255", "name":"BleuCiel1"}, {"code":"126192238", "name":"BleuCiel2"}, {"code":"108166205", "name":"BleuCiel3"}, {"code":"074112139", "name":"BleuCiel4"}, {"code":"176226255", "name":"BleuCielClair1"}, {"code":"164211238", "name":"BleuCielClair2"}, {"code":"141182205", "name":"BleuCielClair3"}, {"code":"096123139", "name":"BleuCielClair4"}, {"code":"198226255", "name":"GrisArdoise1"}, {"code":"185211238", "name":"GrisArdoise2"}, {"code":"159182205", "name":"GrisArdoise3"}, {"code":"108123139", "name":"GrisArdoise4"}, {"code":"202225255", "name":"BleuAcierClair1"}, {"code":"188210238", "name":"BleuAcierClair2"}, {"code":"162181205", "name":"BleuAcierClair3"}, {"code":"110123139", "name":"BleuAcierClair4"}, {"code":"191239255", "name":"BleuClair1"}, {"code":"178223238", "name":"BleuClair2"}, {"code":"154192205", "name":"BleuClair3"}, {"code":"104131139", "name":"BleuClair4"}, {"code":"209238238", "name":"CyanClair2"}, {"code":"180205205", "name":"CyanClair3"}, {"code":"122139139", "name":"CyanClair4"}, {"code":"187255255", "name":"TurquoisePâle1"}, {"code":"174238238", "name":"TurquoisePâle2"}, {"code":"150205205", "name":"TurquoisePâle3"}, {"code":"102139139", "name":"TurquoisePâle4"}, {"code":"152245255", "name":"PétroleClair1"}, {"code":"142229238", "name":"PétroleClair2"}, {"code":"122197205", "name":"PétroleClair3"}, {"code":"083134139", "name":"PétroleClair4"}, {"code":"000245255", "name":"Turquoise1"}, {"code":"000229238", "name":"Turquoise2 "}, {"code":"000197205", "name":"Turquoise3"}, {"code":"000134139", "name":"Turquoise4"}, {"code":"000255255", "name":"Cyan"}, {"code":"000238238", "name":"Cyan2"}, {"code":"000205205", "name":"Cyan3"}, {"code":"000139139", "name":"Cyan4"}, {"code":"151255255", "name":"GrisSombre"}, {"code":"141238238", "name":"BleuArdoiseSombre2"}, {"code":"121205205", "name":"GrisArdoiseSombre3"}, {"code":"082139139", "name":"BleuArdoiseSombre4"}, {"code":"118238198", "name":"Aigue-marine2"}, {"code":"069139116", "name":"Aigue-marine4"}, {"code":"193255193", "name":"VertOcéanSombre1"}, {"code":"180238180", "name":"VertOcéanSombre2"}, {"code":"155205155", "name":"VertOcéanSombre3"}, {"code":"105139105", "name":"VertOcéanSombre4"}, {"code":"084255159", "name":"VertOcéan1"}, {"code":"078238148", "name":"VertOcéan2"}, {"code":"067205128", "name":"VertOcéan3"}, {"code":"154255154", "name":"VertPâle1"}, {"code":"144238144", "name":"VertPâle2"}, {"code":"124205124", "name":"VertPâle3"}, {"code":"084139084", "name":"VertPâle4"}, {"code":"000238118", "name":"VertPrintemps2"}, {"code":"000205102", "name":"VertPrintemps3"}, {"code":"000139069", "name":"VertPrintemps4"}, {"code":"000238000", "name":"Vert2"}, {"code":"000205000", "name":"Vert3"}, {"code":"000139000", "name":"Vert4"}, {"code":"118238000", "name":"Chartreuse2"}, {"code":"102205000", "name":"Chartreuse3"}, {"code":"069139000", "name":"Chartreuse4"}, {"code":"192255062", "name":"VertOliveTerne1"}, {"code":"179238058", "name":"VertOliveTerne2"}, {"code":"105139034", "name":"VertOliveTerne4"}, {"code":"202255112", "name":"VertOliveSombre1"}, {"code":"188238104", "name":"VertOliveSombre2"}, {"code":"162205090", "name":"VertOliveSombre3"}, {"code":"110139061", "name":"VertOliveSombre4"}, {"code":"255246143", "name":"kaki1"}, {"code":"238230133", "name":"kaki2"}, {"code":"205198115", "name":"kaki3"}, {"code":"139134078", "name":"kaki4"}, {"code":"255236139", "name":"JaunePailleClair1"}, {"code":"238220130", "name":"JaunePailleClair2"}, {"code":"205190112", "name":"JaunePailleClair3"}, {"code":"139129076", "name":"JaunePailleClair4"}, {"code":"238238209", "name":"JauneClair2"}, {"code":"205205180", "name":"JauneClair3"}, {"code":"139139122", "name":"JauneClair4"}, {"code":"238238000", "name":"Jaune2"}, {"code":"205205000", "name":"Jaune3"}, {"code":"139139000", "name":"Jaune4"}, {"code":"238201000", "name":"Or2"}, {"code":"205173000", "name":"Or3"}, {"code":"139117000", "name":"Or4"}, {"code":"255193037", "name":"JaunePaille1"}, {"code":"238180034", "name":"JaunePaille2 "}, {"code":"205155029", "name":"JaunePaille3 "}, {"code":"139105020", "name":"JaunePaille4"}, {"code":"255185015", "name":"JaunePailleSombre1"}, {"code":"238173014", "name":"JaunePailleSombre2"}, {"code":"205149012", "name":"JaunePailleSombre3"}, {"code":"139101008", "name":"JaunePailleSombre4"}, {"code":"255193193", "name":"BoisDeRose1"}, {"code":"238180180", "name":"BoisDeRose2"}, {"code":"205155155", "name":"BoisDeRose3"}, {"code":"139105105", "name":"BoisDeRose4"}, {"code":"255106106", "name":"RougeIndien1"}, {"code":"238099099", "name":"RougeIndien2"}, {"code":"205085085", "name":"RougeIndien3"}, {"code":"139058058", "name":"RougeI+ndien4"}, {"code":"255130071", "name":"Terre-de–sienne1"}, {"code":"238121066", "name":"Terre-de-sienne2"}, {"code":"205104057", "name":"Terre-de-sienne3"}, {"code":"139071038", "name":"Terre-de-sienne4"}, {"code":"255211155", "name":"BoisDur1"}, {"code":"238197145", "name":"BoisDur2"}, {"code":"205170125", "name":"BoisDur3"}, {"code":"139115085", "name":"BoisDur4"}, {"code":"255231186", "name":"Blé1"}, {"code":"238216174", "name":"Blé2"}, {"code":"205186150", "name":"Blé3"}, {"code":"139126102", "name":"Blé4"}, {"code":"255165079", "name":"BrunTané1"}, {"code":"238154073", "name":"BrunTané2"}, {"code":"139090043", "name":"BrunTané4"}, {"code":"255127036", "name":"Chocolat1"}, {"code":"238118033", "name":"Chocolat2"}, {"code":"205102029", "name":"Chocolat3"}, {"code":"255048048", "name":"RougeBrique1"}, {"code":"238044044", "name":"RougeBrique2"}, {"code":"205038038", "name":"RougeBrique3"}, {"code":"139026026", "name":"RougeBrique4"}, {"code":"255064064", "name":"Brun1"}, {"code":"238059059", "name":"Brun2"}, {"code":"205051051", "name":"Brun3"}, {"code":"139035035", "name":"Brun4"}, {"code":"255140105", "name":"Saumon1"}, {"code":"238130098", "name":"Saumon2"}, {"code":"205112084", "name":"Saumon3 "}, {"code":"139076057", "name":"Saumon4"}, {"code":"238149114", "name":"SaumonClair2"}, {"code":"205129098", "name":"SaumonClair3"}, {"code":"139087066", "name":"SaumonClair4"}, {"code":"238154000", "name":"Orange2"}, {"code":"205133000", "name":"Orange3"}, {"code":"139090000", "name":"Orange4"}, {"code":"255127000", "name":"OrangeSombre1"}, {"code":"238118000", "name":"OrangeSombre2"}, {"code":"205102000", "name":"OrangeSombre3"}, {"code":"139069000", "name":"OrangeSombre4"}, {"code":"255114086", "name":"corail1"}, {"code":"238106080", "name":"corail2"}, {"code":"205091069", "name":"corail3"}, {"code":"139062047", "name":"corail4"}, {"code":"238092066", "name":"RougeTomate2"}, {"code":"205079057", "name":"RougeTomate3"}, {"code":"139054038", "name":"RougeTomate4"}, {"code":"238064000", "name":"RougeOrangé2"}, {"code":"205055000", "name":"RougeOrangé3"}, {"code":"139037000", "name":"RougeOrangé4"}, {"code":"238000000", "name":"Rouge2"}, {"code":"205000000", "name":"Rouge3"}, {"code":"139000000", "name":"Rouge4"}, {"code":"238018137", "name":"RoseProfond2"}, {"code":"205016118", "name":"RoseProfond3"}, {"code":"139010080", "name":"RoseProfond4"}, {"code":"255110180", "name":"RoseChaud1"}, {"code":"238106167", "name":"RoseChaud2"}, {"code":"205096144", "name":"RoseChaud3"}, {"code":"139058098", "name":"RoseChaud4"}, {"code":"255181197", "name":"rose1"}, {"code":"238169184", "name":"rose2"}, {"code":"205145158", "name":"rose3"}, {"code":"139099108", "name":"rose4"}, {"code":"255174185", "name":"RoseClair1"}, {"code":"238162173", "name":"RoseClair2"}, {"code":"205140149", "name":"RoseClair3"}, {"code":"139095101", "name":"RoseClair4"}, {"code":"255130171", "name":"RougeViolacéPâle1"}, {"code":"238121159", "name":"RougeViolacéPâle2"}, {"code":"205104137", "name":"RougeViolacéPâle3"}, {"code":"139071093", "name":"RougeViolacéPâle4"}, {"code":"255052179", "name":"Marron1"}, {"code":"238048167", "name":"Marron2"}, {"code":"205041144", "name":"Marron3"}, {"code":"139028098", "name":"Marron4"}, {"code":"255062150", "name":"RougeViolacé1"}, {"code":"238058140", "name":"RougeViolacé2"}, {"code":"205050120", "name":"RougeViolacé3"}, {"code":"139034082", "name":"RougeViolacé4"}, {"code":"238000238", "name":"Magenta2"}, {"code":"205000205", "name":"Magenta3"}, {"code":"139000139", "name":"Magenta4"}, {"code":"255131250", "name":"Orchidée1"}, {"code":"238122233", "name":"Orchidée2"}, {"code":"205105201", "name":"Orchidée3"}, {"code":"139071137", "name":"Orchidée4"}, {"code":"255187255", "name":"Prune1"}, {"code":"238174238", "name":"Prune2"}, {"code":"205150205", "name":"Prune3"}, {"code":"139102139", "name":"Prune4"}, {"code":"224102255", "name":"OrchidéeMoyen1"}, {"code":"209095238", "name":"OrchidéeMoyen2"}, {"code":"180082205", "name":"OrchidéeMoyen3"}, {"code":"122055139", "name":"OrchidéeMoyen4"}, {"code":"191062255", "name":"OrchidéeSombre1"}, {"code":"178058238", "name":"OrchidéeSombre2"}, {"code":"154050205", "name":"OrchidéeSombre3"}, {"code":"104034139", "name":"OrchidéeSombre4"}, {"code":"155048255", "name":"Violet1"}, {"code":"145044238", "name":"Violet2"}, {"code":"125038205", "name":"Violet3"}, {"code":"085026139", "name":"Violet4"}, {"code":"171130255", "name":"VioletMoyen1"}, {"code":"159121238", "name":"VioletMoyen2"}, {"code":"137104205", "name":"VioletMoyen3"}, {"code":"093071139", "name":"VioletMoyen4"}, {"code":"255225255", "name":"Chardon1"}, {"code":"238210238", "name":"Chardon2"}, {"code":"205181205", "name":"Chardon3"}, {"code":"139123139", "name":"Chardon4"}, {"code":"003003003", "name":"Gris1"}, {"code":"005005005", "name":"Gris2"}, {"code":"008008008", "name":"Gris3"}, {"code":"010010010", "name":"Gris4"}, {"code":"013013013", "name":"Gris5"}, {"code":"015015015", "name":"Gris6"}, {"code":"018018018", "name":"Gris7"}, {"code":"020020020", "name":"Gris8"}, {"code":"023023023", "name":"Gris9"}, {"code":"026026026", "name":"Gris10"}, {"code":"028028028", "name":"Gris11"}, {"code":"031031031", "name":"Gris12"}, {"code":"033033033", "name":"Gris13"}, {"code":"036036036", "name":"Gris14"}, {"code":"038038038", "name":"Gris15"}, {"code":"041041041", "name":"Gris16"}, {"code":"043043043", "name":"Gris17"}, {"code":"046046046", "name":"Gris18"}, {"code":"048048048", "name":"Gris19"}, {"code":"051051051", "name":"Gris20"}, {"code":"054054054", "name":"Gris21"}, {"code":"056056056", "name":"Gris22"}, {"code":"059059059", "name":"Gris23"}, {"code":"061061061", "name":"Gris24"}, {"code":"064064064", "name":"Gris25"}, {"code":"066066066", "name":"Gris26"}, {"code":"069069069", "name":"Gris27"}, {"code":"071071071", "name":"Gris28"}, {"code":"074074074", "name":"Gris29"}, {"code":"077077077", "name":"Gris30"}, {"code":"079079079", "name":"Gris31"}, {"code":"082082082", "name":"Gris32"}, {"code":"084084084", "name":"Gris33"}, {"code":"087087087", "name":"Gris34"}, {"code":"089089089", "name":"Gris35"}, {"code":"092092092", "name":"Gris36"}, {"code":"094094094", "name":"Gris37"}, {"code":"097097097", "name":"Gris38"}, {"code":"099099099", "name":"Gris39"}, {"code":"102102102", "name":"Gris40"}, {"code":"107107107", "name":"Gris42"}, {"code":"110110110", "name":"Gris43"}, {"code":"112112112", "name":"Gris44"}, {"code":"115115115", "name":"Gris45"}, {"code":"117117117", "name":"Gris46"}, {"code":"120120120", "name":"Gris47"}, {"code":"122122122", "name":"Gris48"}, {"code":"125125125", "name":"Gris49"}, {"code":"127127127", "name":"Gris50"}, {"code":"130130130", "name":"Gris51"}, {"code":"133133133", "name":"Gris52"}, {"code":"135135135", "name":"Gris53"}, {"code":"138138138", "name":"Gris54"}, {"code":"140140140", "name":"Gris55"}, {"code":"143143143", "name":"Gris56"}, {"code":"145145145", "name":"Gris57"}, {"code":"148148148", "name":"Gris58"}, {"code":"150150150", "name":"Gris59"}, {"code":"153153153", "name":"Gris60"}, {"code":"156156156", "name":"Gris61"}, {"code":"158158158", "name":"Gris62"}, {"code":"161161161", "name":"Gris63"}, {"code":"163163163", "name":"Gris64"}, {"code":"166166166", "name":"Gris65"}, {"code":"168168168", "name":"Gris66"}, {"code":"171171171", "name":"Gris67"}, {"code":"173173173", "name":"Gris68"}, {"code":"176176176", "name":"Gris69"}, {"code":"179179179", "name":"Gris70"}, {"code":"181181181", "name":"Gris71"}, {"code":"184184184", "name":"Gris72"}, {"code":"186186186", "name":"Gris73"}, {"code":"189189189", "name":"Gris74"}, {"code":"191191191", "name":"Gris75"}, {"code":"194194194", "name":"Gris76"}, {"code":"196196196", "name":"Gris77"}, {"code":"199199199", "name":"Gris78"}, {"code":"201201201", "name":"Gris79"}, {"code":"204204204", "name":"Gris80"}, {"code":"207207207", "name":"Gris81"}, {"code":"209209209", "name":"Gris82"}, {"code":"212212212", "name":"Gris83"}, {"code":"214214214", "name":"Gris84"}, {"code":"217217217", "name":"Gris85"}, {"code":"219219219", "name":"Gris86"}, {"code":"222222222", "name":"Gris87"}, {"code":"224224224", "name":"Gris88"}, {"code":"227227227", "name":"Gris89"}, {"code":"229229229", "name":"Gris90"}, {"code":"232232232", "name":"Gris91"}, {"code":"235235235", "name":"Gris92"}, {"code":"237237237", "name":"Gris93"}, {"code":"240240240", "name":"Gris94"}, {"code":"242242242", "name":"Gris95"}, {"code":"247247247", "name":"Gris97"}, {"code":"250250250", "name":"Gris98"}, {"code":"252252252", "name":"Gris99"}, {"code":"000128000", "name":"CitronVertFoncé2"}]; 

// enumeration of translation code associations

// in english
var tl_en = {};
tl_en.accessibilisation_form_title = "Accessibilization form";
tl_en.dom_explorer_title = "Accessible dom explorer. Use arrow key to explore the dom and select an element";
tl_en.bt_add_text = "Add a new accessibility parameter for this dom element";
tl_en.existing_parameters_title = "Existing parameters";
tl_en.bt_modify_text = "Modify the selected accessibility parameter";
tl_en.bt_delete_text = "Delete the selected accessibility parameter";
tl_en.bt_import_text = "Import accessibility parameters for this site";
tl_en.bt_export_text = "export accessibility parameters for this site";
tl_en.bt_close_text = "Close";
tl_en.frm_parameter_title = "Parameter form";
tl_en.txt_description_title = "Description of the parameter";
tl_en.chk_status_title = "Activated";
tl_en.txt_date_creation_title = "Date creation";
tl_en.txt_dom_element_reference_title = "Dom element reference";
tl_en.cmb_type_reference = "Type of reference";
tl_en.reference_absolute = "Absolute reference- to find precisely one element";
tl_en.reference_relative = "Relative reference- to find a group of elements";
tl_en.cmb_action_title = "Action to apply on the dom element";
tl_en.cmb_style_title = "Choose a style to apply on the element";
tl_en.bt_ok_text = "OK";
tl_en.bt_cancel_text = "Cancel";
tl_en.action1 = "Assign a label to this element";
tl_en.action2 = "Say the text when there is a change in this element";
tl_en.action3 = "Say the following text when this element apeare";
tl_en.action4 = "Say the following text when this element disapeare";
tl_en.action5 = "Assign the following key shortcuts to say the text in this element";
tl_en.action6 = "Assign the following key shortcut to bring the focus to this element";
tl_en.action7 = "Assign the following key shortcut to make a click on this element";
tl_en.action8 = "Automatically hide this element";
tl_en.action9 = "Assign the following html attribute to this element";
tl_en.action10 = "Assign the following aria style to this element";
tl_en.aria_alert = "alert: to describe as an alert area";
tl_en.aria_application = "application: to describe as a desktop application (opposable to role document)";
tl_en.aria_article = "article: to describe as an article";
tl_en.aria_banner = "banner: to describe as a banner area";
tl_en.aria_button = "button: to make apeare as a button";
tl_en.aria_checkbox = "checkbox: to make apeare as a checkbox";
tl_en.aria_columnheader = "columnheader: to describe as a column header";
tl_en.aria_combobox = "combobox: to make apeare as a combobox control";
tl_en.aria_complementary = "complementary: to describe as a complementary area";
tl_en.aria_contentinfo = "contentinfo: to describe as a content info area";
tl_en.aria_dialog = "dialog: to make apeare as a dialog box";
tl_en.aria_document = "document: to describe as a document like a text document navigable with arrow keys (opposable to role application)";
tl_en.aria_form = "form: to describe as a form area";
tl_en.aria_grid = "grid: to make apeare as a a table";
tl_en.aria_gridcell = "gridcell: to make apeare as a grid cell of a table";
tl_en.aria_heading1 = "heading1: to make apeare as a level 1 of title";
tl_en.aria_heading2 = "heading2: to make apeare as a level 2 of title";
tl_en.aria_heading3 = "heading3: to make apeare as a level 3 of title";
tl_en.aria_heading4 = "heading4: to make apeare as a level 4 of title";
tl_en.aria_heading5 = "heading5: to make apeare as a level 5 of title";
tl_en.aria_heading6 = "heading6: to make apeare as a level 6 of title";
tl_en.aria_img = "img: to make apeare as an image";
tl_en.aria_imput = "input: to make apeare as a generic type of widget that allows user input";
tl_en.aria_link = "link: to make apeare as a link on which it could be perform a click";
tl_en.aria_list = "list: to describe as a list";
tl_en.aria_listbox = "listbox: to make apeare as a listbox control";
tl_en.aria_listitem = "listitem: to describe as a list item";
tl_en.aria_log = "log: to describe as type of live region where new information is added in meaningful order and old information may disappear. ";
tl_en.aria_main = "main: to describe as the main content area of the page";
tl_en.aria_math = "math: to describe as a math expression";
tl_en.aria_menu = "menu: to make apeare as a menu that offers a list of choices to the user";
tl_en.aria_menubar = "menubar: to make apeare as a menu bar that regroup many menus";
tl_en.aria_menuitem = "menuitem: to make apeare as a menu item";
tl_en.aria_menuitemcheckbox = "menuitemcheckbox: to make apeare as a menu item checkbox";
tl_en.aria_menuitemradio = "menuitemradio: to make apeare as a menu item radio button";
tl_en.aria_navigation = "navigation: to describe as a navigation area that usually regroup several groups of links";
tl_en.aria_note = "note: to describe as a note";
tl_en.aria_option = "option: to make apeare as an option of a combobox";
tl_en.aria_progressbar = "progressbar: to make apeare as a progress bar";
tl_en.aria_radio = "radio: to make apeare as a radio button";
tl_en.aria_radiogroup = "radiogroup: to make apeare as a radio groupe";
tl_en.aria_row = "row: to describe as a row of grids in a table";
tl_en.aria_rowheader = "rowheader: to describe as a row header cell";
tl_en.aria_search = "search: to describe as a search area";
tl_en.aria_select = "select: to describe as a form widget that allows the user to make selections from a set of choices/options";
tl_en.aria_status = "status: to make apeare as a status bar";
tl_en.aria_slider = "slider: to make apeare as as slider control or a user input where the user selects a value from within a given range";
tl_en.aria_tab = "tab: to make apeare as a tab control";
 tl_en.aria_tablist = "tablist: to make apeare as a container of tab controls";
tl_en.aria_tabpanel = "tabpanel: to make apeare as a tab page";
tl_en.aria_textbox = "textbox: to make apeare as a textbox control";
tl_en.aria_timer = "timer: to describe as a type of live region containing a numerical counter which indicates an amount of elapsed time from a start point, or the time remaining until an end point";
tl_en.aria_toolbar = "toolbar: to describe as a tool bar";
tl_en.aria_tooltip = "tooltip: to make apeare as a tooltip or contextual popup that displays a description for an element.";
tl_en.aria_tree = "tree: to make apeare as a treeview control habitually apply to ul lists";
tl_en.aria_treeitem = "treeitem: to make apeare as a item of a treeview";
tl_en.aria_treegrid = "treegrid: to make apeare as a tree grid";

tl_en.error_description = "Error ! No description has been given to this parameter";
tl_en.error_reference = "Error ! The written reference to the element is wrong. There is an error in its syntax.";
tl_en.error_type_reference = "Error ! You didn't choose any type of reference";
tl_en.error_action = "Error ! No action has been choosen to this parameter";
tl_en.error_param = "Error ! You have forgotten to give a precision in an additional field";
tl_en.error_style = "Error ! You have forgotten to select the aria style for this parameter";
tl_en.error_parameter_selection = "Error ! No parameter is currently selected in the list";
tl_en.error_import_json = "Error ! The code given to import is not a valid JSON";
tl_en.error_import_formatting = "Error ! The code given is not formatted properly";
tl_en.msg_deletion = "Do you really want to delete this parameter ?";
tl_en.msg_confirm_location = "Warning ! These parameters are actually made for the site %1. that is different of %2. Are you sure you still want to import them ?";
tl_en.msg_import_success = "%1 new parameters have been imported successfully";
tl_en.msg_importation = "Importation ! Paste here the JSON code of the parameters you want to import for this web site";
tl_en.msg_exportation = "Exportation ! Copy this JSON code and save it some where";
tl_en.msg_accessibility_closing = "Closing of the accessibility form";

// in french
var tl_fr = {};
tl_fr.accessibilisation_form_title = "Formulaire d'accessibilité";
tl_fr.dom_explorer_title = "Explorateur du dom. Utilisez les flèches de direction pour explorer le dom et sélectionner un élément";
tl_fr.bt_add_text = "Ajouter un nouveau paramètre d'accessibilité pour cet élément du dom";
tl_fr.existing_parameters_title = "Paramètres existants";
tl_fr.bt_modify_text = "Modifier le paramètre d'accessibilité sélectionné";
tl_fr.bt_delete_text = "Supprimer le paramètre d'accessibilité sélectionné";
tl_fr.bt_import_text = "Importer des paramètres d'accessibilité pour ce site";
tl_fr.bt_export_text = "Exporter des paramètres d'accessibilité pour ce site";
tl_fr.bt_close_text = "Fermer";
tl_fr.frm_parameter_title = "Formulaire de paramétrage";
tl_fr.txt_description_title = "Description du paramétrage";
tl_fr.chk_status_title = "Activé";
tl_fr.txt_date_creation_title = "Date de création";
tl_fr.txt_dom_element_reference_title = "Référence de l'élément du dom";
tl_fr.cmb_type_reference = "Type de référence";
tl_fr.reference_absolute = "Référence absolue- pour désigner un élément précis";
tl_fr.reference_relative = "Référence relative- pour recenser si possible un groupe d'élément";
tl_fr.cmb_action_title = "Acction à effectuer sur l'élément du dom";
tl_fr.cmb_style_title = "Choisissez un style aria à appliquer à l'élément";
tl_fr.bt_ok_text = "OK";
tl_fr.bt_cancel_text = "Annuler";
tl_fr.action1 = "Assigner un label à cet élément";
tl_fr.action2 = "Dire le texte lorsque se produit un changement dans cet élément";
tl_fr.action3 = "Faire dire le texte suivant lorsque cet élément apparaît";
tl_fr.action4 = "Faire dire le texte suivant lorsque cet élément disparaît";
tl_fr.action5 = "Assigner le raccourci clavier suivant pour faire lire le texte dans cet élément";
tl_fr.action6 = "Assigner le raccourci clavier suivant pour amener le curseur à cet élément";
tl_fr.action7 = "Assigner le raccourci clavier suivant pour effectuer un click sur cet élément";
tl_fr.action8 = "Automatiquement masquer cet élément";
tl_fr.action9 = "Assigner l'attribut HTML suivant à cet élément";
tl_fr.action10 = "Assigner le style aria suivant à cet élément";
tl_fr.aria_alert = "alert: pour le définir comme une zone d'alerte";
tl_fr.aria_application = "application: pour le définir comme une application descktop (opposable au rôle document qui est traditionnellement propre aux pages web)";
tl_fr.aria_article = "article: pour le définir comme une zone d'article";
tl_fr.aria_banner = "banner: pour le définir comme une zone de banière";
tl_fr.aria_button = "button: pour le faire apparaître comme un bouton";
tl_fr.aria_checkbox = "checkbox: pour le faire apparaître comme une case à cocher";
tl_fr.aria_columnheader = "columnheader: pour le définir comme une en-tête de colonne";
tl_fr.aria_combobox = "combobox: pour le faire apparaître comme une zone de liste déroulante";
tl_fr.aria_complementary = "complementary: pour le définir comme une zone complémentaire";
tl_fr.aria_contentinfo = "contentinfo: pour le définir comme une zone contenant des informations";
tl_fr.aria_dialog = "dialog: pour le faire apparaître comme une boîte de dialogue";
tl_fr.aria_document = "document: pour le définir comme un document dans lequel il est possible de naviguer avec les flèches de direction (opposable au rôle application propre aux programmes desktop)";
tl_fr.aria_form = "form: pour le définir comme une zone de formulaire";
tl_fr.aria_grid = "grid: pour le faire apparaître comme un tableau";
tl_fr.aria_gridcell = "gridcell: pour le faire apparaître comme une cellule de tableau";
tl_fr.aria_heading1 = "heading1: pour le faire apparaître comme un titre de niveau 1";
tl_fr.aria_heading2 = "heading2: pour le faire apparaître comme un titre de niveau 2";
tl_fr.aria_heading3 = "heading3: pour le faire apparaître comme un titre de niveau 3";
tl_fr.aria_heading4 = "heading4: pour le faire apparaître comme un titre de niveau 4";
tl_fr.aria_heading5 = "heading5: pour le faire apparaître comme un titre de niveau 5";
tl_fr.aria_heading6 = "heading6: pour le faire apparaître comme un titre de niveau 6";
tl_fr.aria_img = "img: pour le faire apparaître comme une image";
tl_fr.aria_imput = "input: pour le faire apparaître comme un champ standard d'entrée de données";
tl_fr.aria_link = "link: pour le faire apparaître comme un lien sur lequel on peut effectuer un click";
tl_fr.aria_list = "list: pour le définir comme une liste";
tl_fr.aria_listbox = "listbox: pour le faire apparaître comme un contrôle listbox";
tl_fr.aria_listitem = "listitem: pour le définir comme un élément de liste";
tl_fr.aria_log = "log: pour le définir comme une sorte de région d'affichage dans lequel de nouvelles informations s'actualisent dans un ordre indéfini et où toutes les informations peuvent disparaître. ";
tl_fr.aria_main = "main: pour le définir comme la zone principal du contenu de la page";
tl_fr.aria_math = "math: pour le définir comme une expression mathématique";
tl_fr.aria_menu = "menu: pour le définir comme un menu proposant une liste de choix à l'utilisateur";
tl_fr.aria_menubar = "menubar: pour le faire apparaître comme une barre de menus regroupant plusieurs menus";
tl_fr.aria_menuitem = "menuitem: pour le faire apparaître comme un élément de menu";
tl_fr.aria_menuitemcheckbox = "menuitemcheckbox: pour le faire apparaître comme un élément de menu cochable";
tl_fr.aria_menuitemradio = "menuitemradio: pour le faire apparaître comme un élément de menu radio";
tl_fr.aria_navigation = "navigation: pour le définir comme une zone de navigation généralement regroupant des séries de liens";
tl_fr.aria_note = "note: pour le définir comme une note";
tl_fr.aria_option = "option: pour le faire apparaître comme une option de liste déroulante";
tl_fr.aria_progressbar = "progressbar: pour le faire apparaître comme une barre de progression";
tl_fr.aria_radio = "radio: pour le faire apparaître comme un bouton radio";
tl_fr.aria_radiogroup = "radiogroup: pour le faire apparaître comme un groupe de boutons radio";
tl_fr.aria_row = "row: pour le définir comme une ligne de tableau";
tl_fr.aria_rowheader = "rowheader: pour le définir comme une cellule d'en-tête de ligne dans un tableau";
tl_fr.aria_search = "search: pour le définir comme une zone de recherche";
tl_fr.aria_select = "select: pour le définir comme un élément de formulaire qui déroule une liste d'options";
tl_fr.aria_status = "status: pour le faire apparaître comme une barre d'état";
tl_fr.aria_slider = "slider: pour le faire apparaître comme un control slider où l'utilisateur doit choisir une valeur entre des bornes données";
tl_fr.aria_tab = "tab: pour le faire apparaître comme un bouton d'onglet";
 tl_fr.aria_tablist = "tablist: pour le faire apparaître comme un container de boutons d'onglet";
tl_fr.aria_tabpanel = "tabpanel: pour le faire apparaître comme une page d'onglet";
tl_fr.aria_textbox = "textbox: pour le faire apparaître comme un control textbox";
tl_fr.aria_timer = "timer: pour le définir comme une sorte de région d'affichage contenant un compteur numérique which indiquant le temps écoulé ou restant";
tl_fr.aria_toolbar = "toolbar: pour le définir comme une barre d'outils";
tl_fr.aria_tooltip = "tooltip: pour le faire apparaître comme une popup affichant une description pour un autre élément.";
tl_fr.aria_tree = "tree: pour le faire apparaître comme un control d'arborescence habituellement réalisé à partir d'un élément ul";
tl_fr.aria_treeitem = "treeitem: pour le faire apparaître comme un élément d'arborescence";
tl_fr.aria_treegrid = "treegrid: pour le faire apparaître comme une arborescence de cellules";

tl_fr.error_description = "Erreur ! Aucune description n'a été donnée à ce paramétrage";
tl_fr.error_reference = "Erreur ! La référence tapée pour l'élément est éronnée. Il y a une erreur de syntaxe.";
tl_fr.error_type_reference = "Erreur ! Vous n'avez précisé aucun type de référence";
tl_fr.error_action = "Erreur ! Aucune action n'a été désignée pour ce paramétrage";
tl_fr.error_param = "Erreur ! Vous avez oublié d'assigner une valeur à l'un des paramètre complémentaires";
tl_fr.error_style = "Erreur ! Vous avez oublié de préciser le style aria que vous voulez";
tl_fr.error_parameter_selection = "Erreur ! Aucun paramétrage n'est sélectionné dans la liste";
tl_fr.error_import_json = "Erreur ! Le code entré n'est pas un code JSON valide";
tl_fr.error_import_formatting = "Erreur ! Le code entré n'est pas formaté correctement";
tl_fr.msg_deletion = "Voulez vous vraiment supprimer ce paramétrage ?";
tl_fr.msg_confirm_location = "Attention ! Ces paramètrages ont été réalisés pour le site %1. Qui est différent de %2. Êtes-vous sûr de toujours vouloir les importer ?";
tl_fr.msg_import_success = "%1 nouveaux paramétrages ont été importés avec succès";
tl_fr.msg_importation = "Importation ! Collez ici le code JSON des paramétrages que vous voulez importer pour ce site web";
tl_fr.msg_exportation = "Exportation ! Copiez le code JSON suivant et sauvegardez-le quelque part";
tl_fr.msg_accessibility_closing = "Fermeture du formulaire d'accessibilité";

// alert("the WebAccessibilizer all code is correct");
