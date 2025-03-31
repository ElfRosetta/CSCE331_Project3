//<script src="/Project3_Group51/webapp/functions.js"></script>


console.log("functions.js loaded");
function loadSaver(){//at start of session, make stored values valid


    localStorage.setItem("user","guest");

    localStorage.setItem("itemCount","0");//defualt 1 for element


    localStorage.setItem("itemId","");
}


function generateItem(itemId,quantity){//private function to make orders element now
    document.getElementById("cost").textContent=String(parseInt(document.getElementById("cost").textContent)+10*quantity);

    const myNode = document.createElement('div');

    myNode.setAttribute("id",`Item ${itemId}`);

    const itemInfo = document.createElement('p');
    itemInfo.textContent = `Item ID: ${itemId}, Quantity: ${quantity}`;
    myNode.appendChild(itemInfo);

    const buttonDel = document.createElement('button');
    buttonDel.textContent = 'Delete';
    buttonDel.addEventListener('click', function() {
        deleteItemByIdNow(itemId);
    });
    myNode.appendChild(buttonDel);

    const buttonInc = document.createElement('button');
    buttonInc.textContent = 'Increment';
    buttonInc.addEventListener('click', function() {
        editQuantityByIdNow(itemId,1);
    });
    myNode.appendChild(buttonInc);

    const buttonDec = document.createElement('button');
    buttonDec.textContent = 'Decrement';
    buttonDec.addEventListener('click', function() {
        if(quantity>1){
            editQuantityByIdNow(itemId,-1);
        }
    });
    myNode.appendChild(buttonDec);

    const buttonEdit = document.createElement('button');
    buttonEdit.textContent = 'edit';
    buttonEdit.addEventListener('click', function() {
        goToCustom(itemId,quantity);
    });
    myNode.appendChild(buttonEdit);


    return myNode;
}


function checkIfEmpty(){
    if (localStorage.getItem("itemId").length==0){
        const node = document.createElement('p');
        node.setAttribute("id","nothing");
        node.textContent="nothing here";
        document.getElementById("orders").appendChild(node);
    }
}

function checkIfNowNotEmpty(){
    if (localStorage.getItem("itemId").length==0){
        document.getElementById("orders").removeChild(document.getElementById("nothing"));
    }
}


function loadOrder(){//call once on open order page to prepare elements

    document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");

    var itemId = localStorage.getItem("itemId");

    for (i = 0;i<(itemId.length)/5;i++){

        var curQuantity = (parseInt(itemId.substring((i*5),((i+1)*5)-3)));
        var curId = (parseInt(itemId.substring((i*5)+2,(i+1)*5)));

        document.getElementById("orders").appendChild(generateItem(curId,curQuantity));
    }

    checkIfEmpty();
}

function login(userStr){//set user
    localStorage.setItem("user",userStr);
}

function pushToCart(itemId,quantity){//update local data of NEW item
    localStorage.setItem("itemCount",String(quantity+parseInt(localStorage.getItem("itemCount")))); 
    document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");
    localStorage.setItem("itemId",localStorage.getItem("itemId") + String(quantity).padStart(2, '0') + String(itemId).padStart(3, '0'));
}

function deleteItemAtNow(itemIndex){//update local data of removed item and update elements

    var curId = (parseInt(localStorage.getItem("itemId").substring((itemIndex*5)+2,(itemIndex+1)*5)));
    document.getElementById("cost").textContent=String(parseInt(document.getElementById("cost").textContent)+(10*(-parseInt(localStorage.getItem("itemId").substring(5*itemIndex,(5*itemIndex)+2)))));

    deleteItemAt(itemIndex);

    document.getElementById("orders").removeChild(document.getElementById("orders").children[itemIndex]);

    checkIfEmpty();

}

function deleteItemAt(itemIndex){//update local data of removed item and update elements

    localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))-parseInt(localStorage.getItem("itemId").substring(5*itemIndex,(5*itemIndex)+2))));
    document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");
    localStorage.setItem("itemId",(localStorage.getItem("itemId").substring(0,5*itemIndex) + localStorage.getItem("itemId").substring((itemIndex+1)*5)));


}

function editItemAt(itemIndex,itemId){//change item at index to item id
    var index = indexOfId(itemId);
    if (index==-1){
        localStorage.setItem("itemId",(localStorage.getItem("itemId").substring(0,(5*itemIndex)+2) + String(itemId).padStart(3, '0') + localStorage.getItem("itemId").substring((itemIndex+1)*5)));
    }
    else{
        var quantity = parseInt(localStorage.getItem("itemId").substring(5*itemIndex,(5*itemIndex)+2));

        var curId = (parseInt(localStorage.getItem("itemId").substring((itemIndex*5)+2,(itemIndex+1)*5)));

        editQuantityAt(index,quantity);

        localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))-quantity));
        document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");
        localStorage.setItem("itemId",(localStorage.getItem("itemId").substring(0,5*itemIndex) + localStorage.getItem("itemId").substring((itemIndex+1)*5)));

    }
    }
    

function editQuantityAt(itemIndex,quantity){//change quantity in local data

    localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+quantity));
    document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");
    localStorage.setItem("itemId",(localStorage.getItem("itemId").substring(0,5*itemIndex) + String(quantity+parseInt(localStorage.getItem("itemId").substring(5*itemIndex,(5*itemIndex)+2))).padStart(2, '0') + localStorage.getItem("itemId").substring(((itemIndex+1)*5)-3)));
}


function editQuantityAtNow(itemIndex,quantity){//change quantity in local data and update elements

    var curId = (parseInt(localStorage.getItem("itemId").substring((itemIndex*5)+2,(itemIndex+1)*5)));
    document.getElementById("cost").textContent=String(parseInt(document.getElementById("cost").textContent)+10*(-parseInt(localStorage.getItem("itemId").substring(5*itemIndex,(5*itemIndex)+2))));


    editQuantityAt(itemIndex,quantity);
    
    
    document.getElementById("orders").replaceChild(generateItem(parseInt(localStorage.getItem("itemId").substring(5*itemIndex+2,5*(itemIndex+1))),parseInt(localStorage.getItem("itemId").substring(5*itemIndex,(5*itemIndex)+2))),document.getElementById("orders").children[itemIndex]);
}

function pushToCartNow(itemId,quantity){//update local data of new item and update elements
    checkIfNowNotEmpty();
    pushToCart(itemId,quantity);
    document.getElementById("orders").appendChild(generateItem(itemId,quantity));

}


function pushToCartById(itemId,quantity){
    var index = indexOfId(itemId);
    if (index==-1){
        pushToCart(itemId,quantity);
    }
    else{
        editQuantityAt(index,quantity);
    }
}

function pushToCartByIdNow(itemId,quantity){
    var index = indexOfId(itemId);
    if (index==-1){
        pushToCartNow(itemId,quantity);
    }
    else{
        editQuantityAtNow(index,quantity);
    }
}

function deleteItemByIdNow(itemId){
    deleteItemAtNow(indexOfId(itemId));
}

function deleteItemById(itemId){
    deleteItemAt(indexOfId(itemId));
}

function editItemById(itemId,itemNewId){
    editItemAt(indexOfId(itemId),itemNewId);
}

function editQuantityById(itemId,quantity){
    editQuantityAt(indexOfId(itemId),quantity);
}

function editQuantityByIdNow(itemId,quantity){
    editQuantityAtNow(indexOfId(itemId),quantity);
}

function editQuantityAndIdById(itemId,itemNewId,quantity){
    editQuantityById(itemId,quantity);
    if (itemId!=itemNewId){
        editItemById(itemId,itemNewId);
    }
}

function indexOfId(itemId){//or minus 1
    for (i = 0;i<(localStorage.getItem("itemId").length)/5;i++){
        if (itemId == (parseInt(localStorage.getItem("itemId").substring((i*5)+2,(i+1)*5)))){
            return (i);
        }
    }
    return -1;
}



function goToCustom(itemId,quantity){
    localStorage.setItem("customId",String(itemId));
    localStorage.setItem("customQuantity",String(quantity));
    localStorage.setItem("backTo","order");
    localStorage.setItem("backToPlus","");
    window.location.href = window.location.href.replace("order","custom");
}

function goToCustomNew(itemId,addString){
    localStorage.setItem("customId",String(itemId));
    localStorage.setItem("customQuantity","1");
    localStorage.setItem("backTo","menu");
    localStorage.setItem("backToPlus",addString);
    window.location.href = window.location.href.replace("menu","custom");
}


function loadCustom(){
    document.getElementById("item").textContent=localStorage.getItem("customId");
    document.getElementById("quantity").textContent=localStorage.getItem("customQuantity");
    document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");
    var curId = parseInt(localStorage.getItem("customId"));
    document.getElementById("cost").textContent=(parseInt(localStorage.getItem("customQuantity"))*10);
}

function goToOrder(addString){
    localStorage.setItem("backToPlus",addString);
    window.location.href = window.location.href.replace("menu","order");
}