
# WebAccessibilizer
A web javascript to help blind to make html web pages more accessible

## Download
If you are hurry, click the link below to directly download it in your web browser

[Install the WebAccessibilizer in your web browser](https://www.stsolution.org/WebAccessibilizer/WebAccessibilizer.user.js)

## Purpose

When imported into grease monkey or tamper monkey, this script add configuration forms to help blind user to attach labels, create shortcut to read/execute/focus element in web pages he visits.

## How to install the WebAccessibilizer

You should [import the file WebAccessibilizer.user.js](https://www.stsolution.org/WebAccessibilizer/WebAccessibilizer.user.js) into your web browser by extensions as grease monkey for firefox or tamper monkey for google chrome.

In order to simplify this task, I have created in the project the file "install.html" that you can open in your web browser, and simply click on the link ["instal this script"](https://www.stsolution.org/WebAccessibilizer/WebAccessibilizer.user.js).

As I've already said, it will only work if you have in your web browser the good extension (grease monkey or tamper monkey) already installed.

If it is not the case it is easy to find on the web how to install grease monkey or tamper monkey extensions in your web browser.

## main key Shortcut

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
* t pressed two times quickly = show the inner text of the current selected node in a prompt dialog in order to be copied;
* h = say the inner HTML code in the current selected node;
* h pressed two times quickly = show the inner html code  of the current selected node in a prompt dialog in order to be copied;
* enter = show the current node description in a prompt dialog in order to be copied

Also note that you can move quickly between the nodes of the treeview by pressing these keys:

* shift+f = open a search dialog to find a node by its tag name
* f3 = search the next node with the criteria given in the search dialog;
* Ctrl+home = go to the first node  of the treeview. it is always the body tag;
* home = go to the first sibling in the treeview
* end = go to the last sibling in the treeview

As you can see, a blind web developper can quite well use this fields to study a web page.

### the button to add a new configuration parameter

When pressed, it opens the parameter form in order to create an accessibilization parameter for the current selected element in the dom explorer.
This form will be describe below.


### The listview of existing parameters

It is the list of parameters you've already configured.

Note that in this list you can press:

* del to delete the selected parameter;
* space to activate or deactivate a parameter.

### The button to modify the current selected parameter

When pressed, it opens the parameter form in order to modify the configuration for the parameter currently selected in the list of existing parameters.

### The button to delete a parameter

When pressed, it delete the current selected parameter in the list of existing parameters. Of course after a confirmation.

### the button to import parameters

This button opens a prompt dialog in wich you can paste the JSON code of parameters to import.
When the parameters to import has ot been made for the current web site, it will ask you to confirm the importation.

### the button to export parameters

This button opens a prompt dialog displaying you the all JSON code of parameters for the current page.
You are invited to copy it and save it some where on your computer.

### the button close

To close the accessibilization form.

## Description of the parameter form

This form is used to add a new or to modify an existing parameter of accessibility.

Its fields are the following:

### the textbox to describe the purpose of the parameter

Type here in one line the text that describe the roll of the parameter.
If there is a shortcut that will be attached, we advise you to write it at the end of the description, so that you can directly see it when parameters are listed.

### The checkbox to activate or deactivate the parameter

Always checked by default, you can uncheck it if you don't want that the current parameter is been executed anymore.

### the textbox of the date of creation

This field doesn't allow modifications.

### the textbox referencing the element of the page to customize

In this field you will have the reference of the dom element the action of the parameter should be executed.
You will notice that the referencement system look like the one in the css.
But it has its particularities.

Some examples:

* #"bt_close" 
indicate elements with the id "bt_close";

* ."minuscule"
indicate elements with the class "minuscule";

* $"txt_town"
indicate elements with the name "txt_town"

* div
simply indicate div elements 

Note that the character "\" (backslash) indicates that the text after will indicate the children of the previous one.
In the classical css referencement system it is the space character that do the same thing.

### The combobox to choose the type of reference

Obviously this field is related to the previous field of the dom element reference) because it precises if the reference previously typed should find an unique and precise element or either a group of elements.

When the value is absolute in this field, the reference should have indicated a only one element;

and when the value is "relative" in this field, all elements matching the reference will be collected.

### The combobox of action to apply

Here, you should Choose the action to be executed on the html element.

Available actions for the moment are the following:

* Assign a label to the element;
* say the text when there is a change in the element;
* say the following text when the element apeare;
* say the following text when the element dis apeare;
* assign the following key shortcut to say the text in the element;
* assign the following key shortcut to bring the focus to the element;;
* assign the following key shortcut to click on the element;
* automatically hide the element;
* assign the following html attribute to the element.;
* Assign the following aria style to the element

When some of these action are chosen, it will trigger the apearance of additional field in wich some other argument will be asked to be fill.

### Additional fields

They apeare or dis apeare according to the currently selected action in the combobox of actions.

They can be:

* a textbox to type a required text like the text to say when the action is triggered;

* a textbox to type a key shortcut. 
For example: ctrl+shift+s, shift+3, alt+shift+z will be recognized.

* a combobox to choose for example an aria style or role.

### the button OK

To validate all the changes, close the parameter form, and come back to the main accessibilization form.

### the button cancel

To cancel the changes, close the parameter form, and come back to the main accessibilization form.

## information on The autor

The autor of this script is:

* Yannick Daniel Youalé
mailtoloco2011@gmail.com
from Cameroon, in central Africa
