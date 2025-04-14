//<script src="/Project3_Group51/webapp/functions.js"></script>
// Create pool

console.log("functions.js loaded");
function loadSaver(){//at start of session, make stored values valid


    localStorage.setItem("user","guest");
    localStorage.setItem("userID","-1");

    localStorage.setItem("itemCount","0");


    localStorage.setItem("customArray","");
    localStorage.setItem("orderArray","");

    localStorage.setItem("customIndex","-1");
}


function generateItem(customId,customIndex,orderIndex,quantity,cost,myName,syrup,liquid,milk,container,cata){//private function to make orders element now,indexes int, rest string
    
    const myNode = document.createElement('div');

    var quantityShift=0;
    const customIndexShift= document.createElement('p');
    customIndexShift.style.display='none';
    customIndexShift.setAttribute("id",String(customId)+"s");
    customIndexShift.textContent="0";

    myNode.appendChild(customIndexShift);

    myNode.setAttribute("id",String(customId));

    const itemInfo = document.createElement('p');
    itemInfo.textContent = myName+',    Syrup: '+syrup+',    Liquid: '+liquid+',    Milk: '+milk+',    Container: '+container;
    const itemValues = document.createElement('p');
    itemValues.textContent = 'Quantity: '+String(parseInt(quantity))+',    Price: '+String(parseFloat(cost)*parseInt(quantity));
    

    document.getElementById("cost").textContent=String(parseFloat(document.getElementById("cost").textContent)+(parseFloat(cost)*parseInt(quantity)));

    const buttonDel = document.createElement('button');
    buttonDel.textContent = 'Delete';
    buttonDel.addEventListener('click', function() {
        deleteCustomIndex(customIndex+parseInt(customIndexShift.textContent));//position in custom index moves
        repairAbove(customIndex+parseInt(customIndexShift.textContent));
        document.getElementById("orders").removeChild(myNode);
        checkIfEmpty();
        document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");
        document.getElementById("cost").textContent=String(parseFloat(document.getElementById("cost").textContent)-(parseFloat(cost)*(parseInt(quantity)+quantityShift)));
    });
    

    const buttonInc = document.createElement('button');
    buttonInc.textContent = 'Increment';
    buttonInc.addEventListener('click', function() {
        if(quantityShift<999-quantity-1){
            quantityShift+=1;
            localStorage.setItem("customIndex",String(customIndex+parseInt(customIndexShift.textContent)));
            universalShove2(customId,myName,syrup,liquid,milk,container,String(parseInt(quantity)+quantityShift),cost,cata);
            itemValues.textContent = 'Quantity: '+String(parseInt(quantity)+quantityShift)+',    Price: '+String(parseFloat(cost)*(parseInt(quantity)+quantityShift));
            
            document.getElementById("cost").textContent=String(parseFloat(document.getElementById("cost").textContent)+(parseFloat(cost)*+1));
            document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");
        }
    });
    

    const buttonDec = document.createElement('button');
    buttonDec.textContent = 'Decrement';
    buttonDec.addEventListener('click', function() {
        if(quantityShift>-quantity+1){
            quantityShift-=1;
            localStorage.setItem("customIndex",String(customIndex+parseInt(customIndexShift.textContent)));
            universalShove2(customId,myName,syrup,liquid,milk,container,String(parseInt(quantity)+quantityShift),cost,cata);
            itemValues.textContent = 'Quantity: '+String(parseInt(quantity)+quantityShift)+',    Price: '+String(parseFloat(cost)*(parseInt(quantity)+quantityShift));
            document.getElementById("cost").textContent=String(parseFloat(document.getElementById("cost").textContent)+(parseFloat(cost)*-1));
            document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");
        }
    });
    

    const buttonEdit = document.createElement('button');
    buttonEdit.textContent = 'edit';
    buttonEdit.addEventListener('click', function() {
        goToCustom("/menu/"+cata+"/"+myName,customIndex+parseInt(customIndexShift.textContent));
        
    });
    





    myNode.className = 'item';

    // Wrapper for info section (label & values)
    const infoWrapper = document.createElement('div');
    infoWrapper.className = 'item-info-wrapper';

    itemInfo.className = 'item-info';
    itemValues.className = 'item-values';

    infoWrapper.appendChild(itemInfo);
    infoWrapper.appendChild(itemValues);

    // Wrapper for buttons
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'item-buttons';

    buttonDel.className = 'btn delete';
    buttonInc.className = 'btn increment';
    buttonDec.className = 'btn decrement';
    buttonEdit.className = 'btn edit';

    buttonWrapper.appendChild(buttonDel);
    buttonWrapper.appendChild(buttonInc);
    buttonWrapper.appendChild(buttonDec);
    buttonWrapper.appendChild(buttonEdit);

    // Combine all into the item node
    myNode.appendChild(infoWrapper);
    myNode.appendChild(buttonWrapper);


    return myNode;
}


function checkIfEmpty(){//after delete now or load
    if (localStorage.getItem("customArray").length==0){
        const node = document.createElement('p');
        node.setAttribute("id","nothing");
        node.textContent="nothing here";
        document.getElementById("orders").appendChild(node);
    }
}


function loadOrder(){//call once on open order page to prepare elements

    document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");

    customArray = localStorage.getItem("customArray");

    for (i = 0;i<(customArray.length)/8;i++){


        customId=customArray.substring(8*i,8*i+3);

        customIndex=i;
        orderIndex=parseInt(customArray.substring(8*i+3,8*i+8));

        orderStuff = (localStorage.getItem("orderArray").substring(orderIndex).split('!'))[0].split(',');
        quantity= orderStuff[0];
        cost=orderStuff[1];
        myName=orderStuff[2];
        syrup=orderStuff[3];
        liquid=orderStuff[4];
        milk=orderStuff[5];
        container=orderStuff[6];
        cata=orderStuff[7];

        document.getElementById("orders").appendChild(generateItem(customId,customIndex,orderIndex,quantity,cost,myName,syrup,liquid,milk,container,cata));
    }

    checkIfEmpty();
}

function login(userStr){//set user
    localStorage.setItem("user",userStr);
}

function logedUser(){//get user
    return localStorage.getItem("user");
}

function loginID(userIDstr){//set userID
    localStorage.setItem("userID",userIDstr);
}

function logedUserID(){//get userID
    document.getElementById("userLoggedIn").textContent = "Logged In: " + (parseInt(localStorage.getItem("userID")) == -1 ? "Guest" : localStorage.getItem("userID"));
    return localStorage.getItem("userID");
}

function getCartTotal(){
    document.getElementById("cartTotal").textContent = "Total Items: " + localStorage.getItem("itemCount");
    return localStorage.getItem("itemCount");
}



function goToOrder(backTo){
    localStorage.setItem("backTo",backTo);
    window.location.href = "/order";
}

function leaveOrder(){
    window.location.href=localStorage.getItem("backTo");
}

function goToCustom(goTo,customIndex){
    localStorage.setItem("customIndex",customIndex);

    window.location.href = goTo;
}

function goToCustomNew(goTo,backTo){
    localStorage.setItem("customIndex","-1");

    localStorage.setItem("backTo",backTo);
    window.location.href = goTo;
}

function getItemOrdered(all, syrup, liquid, milk, container) {
    all = JSON.parse(all);
    const matchedItem = all.find(item => {

        const normalize = (value) => {
            if (value === null || value === undefined) return '';
            return value;
        };
        return (
            normalize(item.syrup) == normalize(syrup) &&
            normalize(item.liquid) == normalize(liquid) &&
            normalize(item.milk) == normalize(milk) &&
            normalize(item.container) == normalize(container)
        );
    });

    if (!matchedItem) {
        console.warn('No match found in:', all);
    }

    return {
        id: matchedItem.item_id,
        price: matchedItem.price
    }
}

function universalShove(all, myName,syrup,liquid,milk,container,cata,quantity){//all string new
    matchedItem = getItemOrdered(all, syrup, liquid, milk, container);
    id = String(matchedItem.id);
    cost = String(matchedItem.price);
    customIndex = parseInt(localStorage.getItem("customIndex"));
    if (customIndex==-1){

        for (index=0;index<localStorage.getItem("customArray").length;index+=8){
            if (localStorage.getItem("customArray").substring(index,index+3)==id.padStart(3,'0')){
                //just add quantity
                orderIndex=parseInt(localStorage.getItem("customArray").substring(index+3,index+8));
                localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+String(parseInt(localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3))+parseInt(quantity)).padStart(3,"0")+localStorage.getItem("orderArray").substring(orderIndex+3));
                localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)));

                window.location.href = "/menu";
                return;
            }
        }



        customIndex=((localStorage.getItem("customArray").length)/8);//new item go here
        orderIndex=(localStorage.getItem("orderArray").length);//item info go here
        localStorage.setItem("customArray",localStorage.getItem("customArray")+id.padStart(3,'0')+String(orderIndex).padStart(5,'0'));
        localStorage.setItem("orderArray",localStorage.getItem("orderArray")+quantity.padStart(3,"0")+','+cost.padStart(5,"0")+','+myName+','+syrup+','+liquid+','+milk+','+container+','+cata+'!');
        localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)));
        window.location.href = "/menu";
        return;
    }
    else{
        for (index=0;index<localStorage.getItem("customArray").length;index+=8){
            if ((localStorage.getItem("customArray").substring(index,index+3)==id.padStart(3,'0'))){
                //just add quantity
                if (customIndex!=(index/8)){//do not delete self
                    orderIndex=parseInt(localStorage.getItem("customArray").substring(index+3,index+8));
                    localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+String(parseInt(localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3))+parseInt(quantity)).padStart(3,"0")+localStorage.getItem("orderArray").substring(orderIndex+3));
                    localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)));

                    deleteCustomIndex(customIndex);

                    window.location.href = "/order";
                    return;
                }
                else{
                    
                    orderIndex=parseInt(localStorage.getItem("customArray").substring(index+3,index+8));
                    oldQuantity=localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3);
                    localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+quantity.padStart(3,"0")+localStorage.getItem("orderArray").substring(orderIndex+3));
                    localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)-parseInt(oldQuantity)));

                    window.location.href = "/order";
                    return;
                }
                
                
                
            }
        }

        //change in place
        
        newStr =quantity.padStart(3,"0")+','+cost.padStart(5,"0")+','+myName+','+syrup+','+liquid+','+milk+','+container+','+cata+'!';
        newlength = newStr.length;

        orderIndex=parseInt(localStorage.getItem("customArray").substring(8*customIndex+3,8*customIndex+8));//item info go here
        oldlength=(localStorage.getItem("orderArray").substring(orderIndex).split('!'))[0].length+1;
        oldQuantity=localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3);

        localStorage.setItem("customArray",localStorage.getItem("customArray").substring(0,8*customIndex)+id.padStart(3,'0')+localStorage.getItem("customArray").substring(8*customIndex+3));
        localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+newStr+localStorage.getItem("orderArray").substring(orderIndex+oldlength));
        localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)-parseInt(oldQuantity)));

        for (index=customIndex*8+8;index<localStorage.getItem("customArray").length;index+=8){
            localStorage.setItem("customArray",localStorage.getItem("customArray").substring(0,index+3)+String(parseInt(localStorage.getItem("customArray").substring(index+3,index+8))-oldlength+newlength).padStart(5,'0')+localStorage.getItem("customArray").substring(index+8));
        }
        window.location.href = "/order";
        return;
    }
}

function universalShove2(id, myName,syrup,liquid,milk,container,quantity,cost,cata){//all string
    

    customIndex = parseInt(localStorage.getItem("customIndex"));
    if (customIndex==-1){

        for (index=0;index<localStorage.getItem("customArray").length;index+=8){
            if (localStorage.getItem("customArray").substring(index,index+3)==id.padStart(3,'0')){
                //just add quantity
                orderIndex=parseInt(localStorage.getItem("customArray").substring(index+3,index+8));
                localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+String(parseInt(localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3))+parseInt(quantity)).padStart(3,"0")+localStorage.getItem("orderArray").substring(orderIndex+3));
                localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)));
                return;
            }
        }



        customIndex=((localStorage.getItem("customArray").length)/8);//new item go here
        orderIndex=(localStorage.getItem("orderArray").length);//item info go here
        localStorage.setItem("customArray",localStorage.getItem("customArray")+id.padStart(3,'0')+String(orderIndex).padStart(5,'0'));
        localStorage.setItem("orderArray",localStorage.getItem("orderArray")+quantity.padStart(3,"0")+','+cost.padStart(5,"0")+','+myName+','+syrup+','+liquid+','+milk+','+container+','+cata+'!');
        localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)));
        return;
    }
    else{
        for (index=0;index<localStorage.getItem("customArray").length;index+=8){
            if ((localStorage.getItem("customArray").substring(index,index+3)==id.padStart(3,'0'))){
                //just add quantity
                if (customIndex!=(index/8)){//do not delete self
                    orderIndex=parseInt(localStorage.getItem("customArray").substring(index+3,index+8));
                    localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+String(parseInt(localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3))+parseInt(quantity)).padStart(3,"0")+localStorage.getItem("orderArray").substring(orderIndex+3));
                    localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)));

                    deleteCustomIndex(customIndex);

                    return;
                }
                else{
                    
                    orderIndex=parseInt(localStorage.getItem("customArray").substring(index+3,index+8));
                    oldQuantity=localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3);
                    localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+quantity.padStart(3,"0")+localStorage.getItem("orderArray").substring(orderIndex+3));
                    localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)-parseInt(oldQuantity)));

                    return;
                }
                
                
                
            }
        }

        //change in place
        
        newStr =quantity.padStart(3,"0")+','+cost.padStart(5,"0")+','+myName+','+syrup+','+liquid+','+milk+','+container+','+cata+'!';
        console.log(cata);
        newlength = newStr.length;

        orderIndex=parseInt(localStorage.getItem("customArray").substring(8*customIndex+3,8*customIndex+8));//item info go here
        oldlength=(localStorage.getItem("orderArray").substring(orderIndex).split('!'))[0].length+1;
        oldQuantity=localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3);

        localStorage.setItem("customArray",localStorage.getItem("customArray").substring(0,8*customIndex)+id.padStart(3,'0')+localStorage.getItem("customArray").substring(8*customIndex+3));
        localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+newStr+localStorage.getItem("orderArray").substring(orderIndex+oldlength));
        localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+parseInt(quantity)-parseInt(oldQuantity)));

        for (index=customIndex*8+8;index<localStorage.getItem("customArray").length;index+=8){
            localStorage.setItem("customArray",localStorage.getItem("customArray").substring(0,index+3)+String(parseInt(localStorage.getItem("customArray").substring(index+3,index+8))-oldlength+newlength).padStart(5,'0')+localStorage.getItem("customArray").substring(index+8));
        }
        return;
    }
}

function deleteCustomIndex(customIndex){//int
    
    orderIndex=parseInt(localStorage.getItem("customArray").substring(8*customIndex+3,8*customIndex+8));
    oldlength=((localStorage.getItem("orderArray").substring(orderIndex).split('!'))[0]).length+1;
    oldQuantity=localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3);
    for (index=customIndex*8+8;index<localStorage.getItem("customArray").length;index+=8){
        localStorage.setItem("customArray",localStorage.getItem("customArray").substring(0,index+3)+String(parseInt(localStorage.getItem("customArray").substring(index+3,index+8))-oldlength).padStart(5,'0')+localStorage.getItem("customArray").substring(index+8));
    }
    localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+localStorage.getItem("orderArray").substring(orderIndex+oldlength));
    localStorage.setItem("customArray",localStorage.getItem("customArray").substring(0,8*customIndex)+localStorage.getItem("customArray").substring(8*customIndex+8));

    localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))-parseInt(oldQuantity)));
}

function changeQuantityOfBy(customIndex,quantityChange){//ints
    orderIndex=parseInt(localStorage.getItem("customArray").substring(8*customIndex+3,8*customIndex+8));
    oldQuantity=localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3);
    newQuantity=String(parseInt(oldQuantity)+quantityChange).padStart(3,"0");

    localStorage.setItem("orderArray",localStorage.getItem("orderArray").substring(0,orderIndex)+newQuantity+localStorage.getItem("orderArray").substring(orderIndex+3));

    localStorage.setItem("itemCount",String(parseInt(localStorage.getItem("itemCount"))+quantityChange));
}

function loadCustom(){
    document.getElementById("itemCounter").textContent=localStorage.getItem("itemCount");
}

function repairAbove(customIndex){
    for (index=customIndex*8;index<localStorage.getItem("customArray").length;index+=8){
        customId=localStorage.getItem("customArray").substring(index,index+3);
        document.getElementById((customId)+"s").textContent=String(parseInt(document.getElementById((customId)+"s").textContent)-1);
    }
}

function info(customIndex){//string
    orderIndex=parseInt(localStorage.getItem("customArray").substring(8*customIndex+3,8*customIndex+8));//item info go here
    return ((localStorage.getItem("orderArray").substring(orderIndex).split('!'))[0]).split(',');
    //quantity.padStart(3,"0")+','+cost.padStart(5,"0")+','+myName+','+syrup+','+liquid+','+milk+','+container
}

function intArray(){
    ara=[];
    for (index=0;index<localStorage.getItem("customArray").length;index+=8){
        custId=parseInt(localStorage.getItem("customArray").substring(index,index+3));
        orderIndex=parseInt(localStorage.getItem("customArray").substring(index+3,index+8));//item info go here
        quant=parseInt(localStorage.getItem("orderArray").substring(orderIndex,orderIndex+3));
        for (i=0;i<quant;i++){
            ara.push(custId);
        }
    }
    return ara;
}

async function getMaxOrderId(new_url) {
    try {
        const response = await fetch(new_url, {
            method: 'GET'
        });
        
        if (response.ok) {
            const maxOrderId = await response.text();
            return maxOrderId;
        } else {
            console.error('Error getting max order ID');
            return '0';
        }
    } catch (error) {
        console.error('Network error:', error);
        return '0';
    }
}

async function orderPush(new_url){

    if (document.getElementById("itemCounter").textContent=="0"){
        //nothing
        return;
    }

    ara=intArray();
    
    employeeid=parseInt(logedUserID());
    cost=parseFloat(document.getElementById("cost").textContent);
    orderId=parseInt(await getMaxOrderId(new_url + '/maxOrderID'))+1;
    timeStamp = Date.now();

    
    console.log(JSON.stringify({ orderId, timeStamp, employeeid, cost, ara }));
      const response = await fetch(new_url + '/addOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, timeStamp, employeeid, cost, ara })
      });

      if (response.ok) {
        //const data = await response.text();
        //alert(data);
      } else {
        alert('Error adding order');
      }

      window.location.href ="/menu";
}

// Manager Add Employee Button
function AddEmployee()
{

    const name = document.getElementById("AddEmployeeName");
    const id = document.getElementById("AddEmployeeID");
    const password = document.getElementById("AddEmployeePassword");
    const access = document.getElementById("AddEmployeeAccess");

    const nameValue = name.value;
    const idValue = id.value;
    const passwordValue = password.value;
    const accessValue = access.value;

    // Create an object to send in the POST request
    const employeeData = {
        name: nameValue,
        id: idValue,
        password: passwordValue,
        access: accessValue
    };

    // Send data via fetch (AJAX request)
    fetch('/add-employee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response (e.g., update the page or show a message)
        if (data.success) {
            alert("Employee added successfully!");
            location.reload(); // Reload page to show updated list
        } else {
            alert("Error adding employee");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error adding employee");
    });

}

// Manager Delete Employee Button
function DeleteEmployee()
{
    const id = document.getElementById("DeleteEmployeeID");

    const idValue = id.value;

    // Create an object to send in the POST request
    const employeeData = {
        id: idValue,
    };

    // Send data via fetch (AJAX request)
    fetch('/delete-employee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response (e.g., update the page or show a message)
        if (data.success) {
            alert("Employee deleted successfully!");
            location.reload(); // Reload page to show updated list
        } else {
            alert("Error deleting employee");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error deleting employee");
    });

}

//manager edit employee function

async function EditEmployee(id)
{
    const idValue = id.value;
    const employeeData = {
        id: idValue,
    };

    // Send data via fetch (AJAX request)
    fetch('/edit-employee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response (e.g., update the page or show a message)
        if (data.success) {
            alert("Employee found successfully!");
        } else {
            alert("Error editing employee 1");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error editing employee 2");
    });
}

function updateEmployee() {

    //access values from local storage and the submitted update
    const newValue = document.getElementById("valueUpdate");
    const id = document.getElementById("id");
    const choice = document.getElementById("updateEmployee");

    console.log(newValue);
    console.log(id);
    console.log(choice);

    const newValueValue = newValue.value;
    const idValue = id.value;
    const choiceValue = choice.value;

    const updateData = {
        id: idValue,
        choice: choiceValue,
        newValue: newValueValue,
    };

    fetch('/update-employee-value', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response (e.g., update the page or show a message)
        if (data.success) {
            alert("Employee update successful");
        } else {
            alert("Error updating employee 1");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error updating employee 2");
    });
}


const selections = {
    syrup: '',
    milk: '',
    liquid: '',
    container: '',
    price: ''
};

function selectOption(type, value) {
    const buttons = document.querySelectorAll(`.${type}-button`);
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent.trim() === (value === '' ? "None" : value))
        {
            btn.classList.add('selected');
        }
    });
    
    selections[type] = value === 'null' ? null : value;
}

function setDefaultSelections(syrup, milk, liquid, container, price) {
    if (localStorage.getItem("customIndex")=="-1"){
        selections['syrup'] = syrup;
        selections['milk'] = milk;
        selections['liquid'] = liquid;
        selections['container'] = container;
        selections['price'] = price
    }
    else{
        customIndex=parseInt(localStorage.getItem("customIndex"));
        orderIndex=parseInt(localStorage.getItem("customArray").substring(8*customIndex+3,8*customIndex+8));

        orderStuff = (localStorage.getItem("orderArray").substring(orderIndex).split('!'))[0].split(',');
        quantity= orderStuff[0];
        document.getElementById("quantity").textContent=String(parseInt(quantity));
        cost=orderStuff[1]; //per item
        document.getElementById("price").textContent=String(parseFloat(cost) * parseInt(quantity));
        //myName=orderStuff[2];
        selections['syrup'] =orderStuff[3];
        selections['liquid'] =orderStuff[4];
        selections['milk'] =orderStuff[5];
        console.log(orderStuff[5]);
        selections['container'] =orderStuff[6];
        selections['price'] = cost;
        //cata=orderStuff[7];
    }
}

function getValue(selection) {
    return selections[selection];
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

// if (typeof FontAwesome === 'undefined') {
//     const script = document.createElement('script');
//     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js';
//     document.head.appendChild(script);
// }

// Manager Add Item Button
function AddItem()
{

    const itemID = document.getElementById("AddItemID");
    const itemName = document.getElementById("AddItemName");
    const itemPrice = document.getElementById("AddItemPrice");
    const itemMilk = document.getElementById("AddItemMilk");
    const itemSyrup = document.getElementById("AddItemSyrup");
    const itemLiquid = document.getElementById("AddItemLiquid");
    const itemContainer = document.getElementById("AddItemContainer");
    const itemDefault = document.getElementById("AddItemDefault");
    const itemCategory = document.getElementById("AddItemCategory");

    const itemIDValue = itemID.value;
    const itemNameValue = itemName.value;
    const itemPriceValue = itemPrice.value;
    const itemMilkValue = itemMilk.value;
    const itemSyrupValue = itemSyrup.value;
    const itemLiquidValue = itemLiquid.value;
    const itemContainerValue = itemContainer.value;
    const itemDefaultValue = itemDefault.value;
    const itemCateogryValue = itemCategory.value

    // Create an object to send in the POST request
    const itemData = {
        itemID: itemIDValue,
        itemName: itemNameValue,
        itemPrice: itemPriceValue,
        itemMilk: itemMilkValue,
        itemSyrup: itemSyrupValue,
        itemLiquid: itemLiquidValue,
        itemContainer: itemContainerValue,
        itemDefault: itemDefaultValue,
        itemCategory: itemCateogryValue
    };

    // Send data via fetch (AJAX request)
    fetch('/add-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response (e.g., update the page or show a message)
        if (data.success) {
            alert("Item added successfully!");
            location.reload(); // Reload page to show updated list
        } else {
            alert("Error adding item");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error adding item");
    });

}

// Manager Delete Item Button
function DeleteEmployee()
{
    const itemID = document.getElementById("DeleteItemID");

    const idValue = itemID.value;

    // Create an object to send in the POST request
    const itemData = {
        itemID: idValue,
    };

    // Send data via fetch (AJAX request)
    fetch('/delete-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response (e.g., update the page or show a message)
        if (data.success) {
            alert("Item deleted successfully!");
            location.reload(); // Reload page to show updated list
        } else {
            alert("Error deleting item");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error deleting item");
    });

}

// Function for Custom Milk Option
function toggleCustomMilk(select) {
    const customDiv = document.getElementById("customMilkDiv");
    if (select.value === "Other") {
        customDiv.style.display = "block";
    } else {
        customDiv.style.display = "none";
    }
}

// Function for Custom Syrup Option
function toggleCustomSyrup(select) {
    const customDiv = document.getElementById("customSyrupDiv");
    if (select.value === "Other") {
        customDiv.style.display = "block";
    } else {
        customDiv.style.display = "none";
    }
}

// Function for Custom Liquid Option
function toggleCustomLiquid(select) {
    const customDiv = document.getElementById("customLiquidDiv");
    if (select.value === "Other") {
        customDiv.style.display = "block";
    } else {
        customDiv.style.display = "none";
    }
}

// Function for Custom Name Option
function toggleCustomName(select) {
    const customDiv = document.getElementById("customNameDiv");
    if (select.value === "Other") {
        customDiv.style.display = "block";
    } else {
        customDiv.style.display = "none";
    }
}

