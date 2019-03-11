// ==UserScript==
// @name        WebAccessibilizer
// @description Make web pages accessible for blind users with screen readers
// @namespace   mailtoloco
// @author      Yannick Youale mailtoloco2011@gmail.com
// @copyright   Copyright 2019 Yannick Youale
// @license     BSD
// @include     *
// @version     0.1
// @grant       none
// ==/UserScript==

// if you want to change the language for named colors
// change it in the following line
var lang = "fr";
// supported languages are: fr, en.

// these are the public variables we need
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

// we identify the colors language
switch(lang){
case "fr": // 
tColors = tColors_fr;
break;
case "en": // 
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
frmAccessibility.show();
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
t = s.param2 + ". " + s.elm.innerText;
saystring(t);
break;
case "6": //  to bring the focus
saystring(s.param2);
// a little delay before really focussing
window.setTimeout(function(){
s.elm.focus();
}, 1000);
break;
case "7": //  to make a click
saystring(s.param2);
// a little delay before really clicking
window.setTimeout(function(){
var evt = document.createEvent("MouseEvents");
evt.initMouseEvent("click", true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
s.elm.dispatchEvent(evt);
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

function getCurrentDate(precision=2){
// renvoi la date et l'heure courante au format yyyy/mm/dd hh:mm:ss
// en précision, 1 renvoi la date uniquement
// et 2 renvoi la date et l'heure
var thistime = new Date();
var s = "";

var year = thistime.getFullYear();
var month = thistime.getMonth();
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

function findElementByReference(r){
//
var i;
var col = document.all;
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
return elm;

} else { // we should find within the children of the first found
while(true){
if(elm.childNodes.length > r.child.position){
elm = elm.childNodes[r.child.position];
r = r.child;
if(isReferenceMatch(elm, r) == true){
if(! r.child){
// there is no other children to find
// we have reach our destination
return elm;
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
return null;
} catch(ex){
prompt("error " + ex.name, " findElementByReference ex- " + ex.message);
} // End Try
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
j.parameters = [];
return j;
} // End If
j = JSON.parse(s);
return j;
} // End Function

function saveAccessibilityParameters(){
// in the local storage
localStorage.setItem("accessibilityParameters", JSON.stringify(accessibilityParameters));
} // End Function

function implementAccessibilityParameters(){
// after the page is loaded
// implement the parameters setteld to make verious element more accessible
var i;
var p;
var s;
var elm;
// we clear the shortcuts array
keyShortcuts = [];
// we browse the parameters in memory
for(i=0; i<accessibilityParameters.parameters.length; i++){
p = accessibilityParameters.parameters[i];
// we get the dom element referenced
elm = findElementByReference(p.elementReference);
if(! elm){
continue; // failure, we jump to the next one
} // End If
// according to the type of action to do
switch(p.action){
case "1": // add a label to the element
elm.setAttribute("aria-label", p.param1);
// elm.setAttribute("title", p.param1);
break;
case "2": // say the text when there is change in the element
// we use  aria arguments
elm.setAttribute("aria-live", "assertive");
elm.setAttribute("aria-atomic", "false");
elm.setAttribute("aria-revelant", "all");
break;
case "3": // say a text when the element appeare
break;
case "4": // say a text when the element disappeare
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
elm.setAttribute("aria-hidden", "true");
break;
case "9": // assign an html attribute to the element
elm.setAttribute(p.param1, p.param2);
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
currentLevel = 0;
currentPos = 0;
currentNode = null;
listChildNodes();
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
if(elm[i].id == "message_to_say_yyd"){
continue;
} // End If
if(elm[i].id == "dom_explorer_yyd"){
continue;
} // End If
if(elm[i].id == "frmAccessibility_yyd"){
continue;
} // End If
if(elm[i].id == "frmParameter_yyd"){
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

function sayCurrentNodeInnerText(){
//
var s = "";
var elm = currentNodeChildren[currentPos];
saystring("InnerText=" + elm.innerText);
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
var frm;
var elm
try{

// we create the form
frm = document.createElement("form");
this.frm = frm;
frm.setAttribute("id", "frmAccessibility_yyd");
frm.setAttribute("style", "display: none;");
frm.addEventListener('submit', this.frm_Submit, true);
frm.addEventListener('blur', this.frm_Blur, true);

// w create a title inside the form
elm = document.createElement("h2");
elm.innerText = "Accessibilization form";
frm.appendChild(elm);

// we create the dom explorer inside the form 
elm = document.createElement("select");
this.domExplorer = elm;
elm.setAttribute("id", "dom_explorer_yyd");
elm.setAttribute("aria-label", "Accessible dom explorer. Use arrow key to explore the dom and select an element");
elm.setAttribute("size", "3");
elm.addEventListener('keydown', this.explorer_KeyDown, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// we create the button to âdd a new parameter inside the form 
elm = document.createElement("button");
elm.innerText = "Add a new accessibility parameter for this dom element";
elm.addEventListener('click', this.btAdd_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// we create the existing parameters list inside the form 
elm = document.createElement("select");
this.lstParameters = elm;
elm.setAttribute("id", "parameters_list_yyd");
elm.setAttribute("aria-label", "Existing parameters");
elm.setAttribute("size", "8");
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// we create the button to Modify the selected parameter inside the form 
elm = document.createElement("button");
elm.innerText = "Modify the selected accessibility parameter";
elm.addEventListener('click', this.btModify_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// we create the button to delete the selected parameter inside the form 
elm = document.createElement("button");
elm.innerText = "Delete the selected accessibility parameter";
elm.addEventListener('click', this.btDelete_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// we create the button to import configuration file inside the form 
elm = document.createElement("button");
elm.innerText = "Import accessibility parameters for this site";
elm.addEventListener('click', this.btImport_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// we create the button to export configuration file inside the form 
elm = document.createElement("button");
elm.innerText = "export accessibility parameters for this site";
elm.addEventListener('click', this.btExport_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// we create the button to close/hide the form
elm = document.createElement("button");
this.btClose = elm;
elm.innerText = "Close";
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

explorer_KeyDown(e){
// à while pressing keys on the accessible dom explorer
var k = e.keyCode;
// saystring(k);

// left = 37
if(k == 37){
listParentNodes();
return true;
} // End If

// up = 38
if(k == 38){
prevNode();
return true;
} // End If

// right = 39
if(k == 39){
listChildNodes();
return true;
} // End If

// down = 40
if(k == 40){
nextNode();
return true;
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
lastCibling();
return true;
} // End If

// n = 78 to get the names
if(k == 78){
sayCurrentNodeNames();
return true;
} // End If

// t = 84 to get the innerText
if(k == 84){
sayCurrentNodeInnerText();
return true;
} // End If

// c = 67 to get the colors
if(k == 67){
sayCurrentNodeColors()
return true;
} // End If

// b = 66 to get the borders
if(k == 66){
sayCurrentNodeBorders();
return true;
} // End If


// m = 77 to get the margins
if(k == 77){
sayCurrentNodeMargin();
return true;
} // End If

// d = 68 to get the dimensions
if(k == 68){
sayCurrentNodeDimensions();
return true;
} // End If

// p = 80 to get the positions
if(k == 80){
sayCurrentNodePositions();
return true;
} // End If

// f = 70 to find a node
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
e.preventDefault();
saystring("next");
findNext();
return true;
} // End If

// enter = 13
if(k == 13){
promptCurrentNode();
return true;
} // End If

// z = 90 for testing
if(k == 90){
testor();
return true;
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
alert("No parameter currently selected");
return;
} // End If
// we ask for a confirmation
if(! confirm("Do you really want to delete this parameter ?")){
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
// and finally we record the changes in the local storage
saveAccessibilityParameters();
} catch(ex){
alert("erreur " + ex.name + " ClFrmAccessibility btDelete_click " + ex.message);
} // End Try
} // end function

btImport_Click(e){
//
alert("This feature is not yet ready");
} // end function

btExport_Click(e){
//
alert("This feature is not yet ready");
} // end function

btClose_Click(e){
//
frmAccessibility.hide();
frmAccessibility.lastSelectedElement = null;
saystring("Closing of the accessibility form");
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
try{
for(i=0; i<accessibilityParameters.parameters.length; i++){
this.lstParameters.add(createNewOption(i, accessibilityParameters.parameters[i].description));
} // End For
} catch(ex){
alert("ClFrmAccessibility fillParametersList- " + ex.message);
} // End Try
} // End Function

show(){
// to display the main accessibility form
saystring("Accessibilization form");
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
frm.setAttribute("id", "frmParameter_yyd");
frm.setAttribute("style", "display: none;");
frm.addEventListener('submit', this.frm_Submit, true);
frm.addEventListener('blur', this.frm_Blur, true);

// w create a title inside the form
elm = document.createElement("h2");
elm.innerText = "Parameter form";
frm.appendChild(elm);

// the textbox of parameter description
elm = document.createElement("input");
this.txtDescription = elm;
elm.setAttribute("type", "text");
elm.setAttribute("title", "Description of the parameter");
elm.addEventListener('keydown', this.txtDescription_KeyDown, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the textbox of creation date
elm = document.createElement("input");
this.txtDateCreation = elm;
elm.setAttribute("type", "text");
elm.setAttribute("title", "Date creation");
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the textbox of the dom element reference
elm = document.createElement("input");
this.txtElementReference = elm;
elm.setAttribute("type", "text");
elm.setAttribute("title", "Dom element reference");
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the combobox of action to apply
elm = document.createElement("select");
this.cmbAction = elm;
elm.setAttribute("title", "Action to apply on the dom element");
// we add its items
elm.add(createNewOption("1", "Assign a label to this element"));
elm.add(createNewOption("2", "Say the text when there is a change in this element"));
elm.add(createNewOption("3", "Say the following text when this element appeare"));
elm.add(createNewOption("4", "Say the following text when this element disappeare"));
elm.add(createNewOption("5", "Assign the following key shortcuts to say the text in this element"));
elm.add(createNewOption("6", "Assign the following key shortcut to bring the focus to this element"));
elm.add(createNewOption("7", "Assign the following key shortcut to make a click on this element"));
elm.add(createNewOption("8", "Automatically hide this element"));
elm.add(createNewOption("9", "Assign the following html attribute to this element"));
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

// the button ok
elm = document.createElement("button");
elm.innerText = "OK";
elm.addEventListener('click', this.btOK_Click, true);
frm.appendChild(elm);
elm = document.createElement("br");
frm.appendChild(elm);

// the button cancel
elm = document.createElement("button");
this.btCancel = elm;
elm.innerText = "Cancel";
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
frmParameter.txtParam1.title = "Type the text to say when this element appeare";
frmParameter.txtParam1.style.display = "block";
break;
case "4": // 
frmParameter.txtParam1.title = "Type the text to say when this element disappeare";
frmParameter.txtParam1.style.display = "block";
break;
case "5": // 
frmParameter.txtParam1.title = "Type the key shortcut to execute in order to read the text in the element";
frmParameter.txtParam1.style.display = "block";
frmParameter.txtParam2.title = "Type the text to say when the key shortcut is triggered";
frmParameter.txtParam2.style.display = "block";
break;
case "6": // 
frmParameter.txtParam1.title = "Type the key shortcut to execute in order to move to the element";
frmParameter.txtParam1.style.display = "block";
frmParameter.txtParam2.title = "Type the text to say when the key shortcut is triggered";
frmParameter.txtParam2.style.display = "block";
break;
case "7": // 
frmParameter.txtParam1.title = "Type the key shortcut to execute in order to click on the element";
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
} // End switch
} // End Function

initializeAdditionalParameters(){
// first we hide them all
frmParameter.txtParam1.style.display = "none";
frmParameter.txtParam2.style.display = "none";
frmParameter.txtParam3.style.display = "none";
// then we initialize their titles
frmParameter.txtParam1.title = "";
frmParameter.txtParam2.title = "";
frmParameter.txtParam3.title = "";
} // End Function

btOK_Click(e){
// to record the changes

try{
// first we check if everything is OK
if(frmParameter.txtDescription.value == ""){
alert("Error ! No description has been given to this parameter");
frmParameter.txtDescription.focus();
return;
} // End If
if(frmParameter.cmbAction.value < 0){
alert("Error ! No action has been choosen to this parameter");
frmParameter.cmbAction.focus();
return;
} // End If
if(frmParameter.txtParam1.style.display == "block"){
if(frmParameter.txtParam1.value == ""){
alert("Error ! You have forgotten to give a precision to this parameter");
frmParameter.txtParam1.focus();
return;
} // End If
} // End If
if(frmParameter.txtParam2.style.display == "block"){
if(frmParameter.txtParam2.value == ""){
alert("Error ! You have forgotten to give a precision to this parameter");
frmParameter.txtParam2.focus();
return;
} // End If
} // End If
if(frmParameter.txtParam3.style.display == "block"){
if(frmParameter.txtParam3.value == ""){
alert("Error ! You have forgotten to give a precision to this parameter");
frmParameter.txtParam3.focus();
return;
} // End If
} // End If

// we transfer the values to the temporary parameter object
frmParameter.parameter.description = frmParameter.txtDescription.value;
frmParameter.parameter.dateCreation = frmParameter.txtDateCreation.value;
frmParameter.parameter.elementReference = JSON.parse(frmParameter.txtElementReference.value);
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
frmParameter.hide();
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
saystring("Parameter form");
window.setTimeout(function(){
frmParameter.parameterIndex = parameterIndex;
if(parameterIndex == -1){
frmParameter.parameter = {};
frmParameter.parameter.description = "";
frmParameter.parameter.dateCreation = getCurrentDate();
frmParameter.parameter.elementReference = getElementReference();
frmParameter.parameter.action = "";
frmParameter.parameter.param1 = "";
frmParameter.parameter.param2 = "";
frmParameter.parameter.param3 = "";
frmParameter.parameter.status = "1";
} else { // the parameter exists
frmParameter.parameter = accessibilityParameters.parameters[parameterIndex];
} // End If

// we send values to their respective fields
frmParameter.txtDescription.value = frmParameter.parameter.description;
frmParameter.txtDateCreation.value = frmParameter.parameter.dateCreation;
frmParameter.txtElementReference.value = JSON.stringify(frmParameter.parameter.elementReference);
frmParameter.cmbAction.value = frmParameter.parameter.action;
frmParameter.txtParam1.value = frmParameter.parameter.param1;
frmParameter.txtParam2.value = frmParameter.parameter.param2;
frmParameter.txtParam3.value = frmParameter.parameter.param3;
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

// alert("the WebAccessibilizer all code is correct");
