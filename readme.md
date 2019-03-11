# WebAccessibilizer
A web javascript to help blind to make html web pages more accessible

## A. Purpose

When imported into grease monkey or tamper monkey, this script add configuration forms to help blind user to attach labels, create shortcut to read/execute/focus element in web pages he visits.

## C. How to install the WebAccessibilizer

You should import the file WebAccessibilizer.user.js into your webbrowser by extensions as grease monkey for firefox or tamper monkey for google chrome.

In order to simplify this task, I have created the file "install.html" that you can open in your web browser, and simply click on the link "instal this script".

It will only work if you have in your webbrowser the good extension (grease monkey or tamper monkey) already installed.

If it is not the case it is easy to find on the web how to install grease monkey or tamper monkey in your web browser.

## B. main key Shortcut

You should make ctrl+shift+f2 to open the main accessibilization form.

Before executing this shortcut, if you want to customize a element of the current page, you should place the cursor on it in order this element be selected in the dom explorer of the accessibilisation form when it opens.

## description of the accessibilization form

On the accessibilization form, you will find these fields:

### the treeview of dom explorer

You move between the hierarchy of the elements of the current page with arrow keys.

Select the one you want to customize before doing tab to go to the next field.

However, note that you can force the vocal synthesis to say somme informations on the dom explorer by pressing these keys::

* b = say the borders of the current selected node
* c = say the colors (background and text) of the current selected node
* d = say the dimensions (width and height) of the current selected node
* f = say the font family in the current selected node;
* m = say the margins in the current selected node
* n = say the type, name, and class of the current selected node
* p = say the absolute positions (left and top) of the current selected node
* t = say the inner text in the current selected node
* enter = show the current node description in a prompt dialog in order to be selected and copied

Also note that you can move quickly between the nodes of the treeview by pressing these keys:

* shift+f = open e search dialog to find a node by its tag name
* f3 = search the next node with the criteria given in the search dialog;
* Ctrl+home = go to the first node  of the treeview. it is always the body tag;
* home = go to the first cibling
* end = go to the last cibling

### the button to add a new configuration parameter

When pressed, it opens the parameter form in order to create an accessibilization parameter for the current selected element in the dom explorer.

### The listview of existing parameters

It is the list of parameters you've already configured.

### The button to modify the current selected parameter
When pressed, it opens the parameter form in order to modify the configuration for the parameter currently selected in the list of existing parameters.

### The button to delete parameter

When pressed, it delete the current selected parameter in the list of existing parameter. Of course after a confirmation.

### the button to import parameters

Not yet implemented

### the button to export parameters

Not yet implemented

### the button close

To close the accessibilization form.

## Description of the parameter form

This form is used to add a new or to modify an existing parameter of accessibility.

Its fields are the following:

### the textbox to describe the purpose of the parameter

Type here in one line the text that describe the roll of the parameter.
If there is a shortcut that will be attached, we advise you to at the and write this shortcut so that it appeare also in that description.

### the textbox of the date of creation

Normally you don't have to modify this field.

### the reference of the element of the page to customize

Normally you don't have to modify this field.

### The combobox of action to apply

Here, you should Choosse the action to execute on the html element.

Available actions are the following:

* Assign a label to the element;
* say the text when there is a change in the element;
* say the following text when the element appeare;
* say the following text when the element disappeare;
* assign the following key shortcut to say the text in the element;
* assign the following key shortcut to bring the focus to the element;;
* assign the following key shortcut to click on the element;
* automatically hide the element;
* assign the following html attribute to the element.

When some of these action are choosen, it will trigger the appearence of additional field in wich some other argument will be asked to fill.

### the button OK

To validate all the changes, close the parameter form, and come back to the main accessibilization form.

### the button cancel

To cancel the changes, close the parameter form, and come back to the main accessibilization form.

## D. information on The autors

The autors of this script are:

* Yannick Daniel Youale
mailtoloco2011@gmail.com
from Cameroon, in central Africa
