 steem.api.setOptions({
     url: 'https://api.steemit.com'
 });

 // Form global variables
 var followers = [];
 var count;
 var the_user;
 var vesting_steem;
 var vesting_shares;
 var spr;
 
 // Clear screen
 document.getElementById("user").innerHTML = "";
 document.getElementById("sp").innerHTML = "";
 document.getElementById("created").innerHTML = "";
 document.getElementById("post").innerHTML = "";
 document.getElementById("voted").innerHTML = "";
 document.getElementById('spinner').style.display = "none";

//Initial function
 function initialize() {
     document.getElementById('spinner').style.display = "block";
     followers = [];
     count = 1;
     document.getElementById("user").innerHTML = "";
     document.getElementById("sp").innerHTML = "";
     document.getElementById("created").innerHTML = "";
     document.getElementById("post").innerHTML = "";
     document.getElementById("voted").innerHTML = "";

     steem.api.getDynamicGlobalProperties(function(err, result) { // Get global data from Steem
         console.log(err, result);
         vesting_steem = parseFloat(result.total_vesting_fund_steem); // get vesting fund steem
         vesting_shares = parseFloat(result.total_vesting_shares); // get vesting shares
         spr = vesting_steem / vesting_shares; // calculate steem per vest to calculate SP of user
     });

     the_user = document.getElementById("user_name").value; //get username from input div
     if (the_user == "username") {
         window.alert("Please enter a username.") //username shouldn't be left as "username" 

     }
     if (the_user == "") {
         window.alert("Please enter a username.") //username shouldn't be left blank

     }
     if ((the_user != "username") && (the_user != "")) {
         search(the_user); //if no problem, send the username to SEARCH function
         
     }


 }



 function search(the_user) {


     steem.api.getFollowCount(the_user, function(err, result) { //get the quantity of followers from Steem
         var qty = result.follower_count;

         get_followers(qty); //send the qunatity to GET_FOLLOWERS function 
     });

 }

 function get_followers(qty) {

    
     steem.api.getFollowers(the_user,
         '',
         'blog',
         1000,
         function(err, result) {
             console.log(result);
             followers = followers.concat(result); //get the first 1000 followers and assign it followers array
             if (qty > 1000) {
                 get_rest(followers, qty); // if follower quantity is greater than 1000, send resuly to GET_REST function to calculate more
             } else {
                 get_follower_data(followers); // if less than 1000 send result to GET_FOLLOWER_DATA function to get data
             }
         });
 }

 function get_rest(followers, qty) {
     
     var i = parseInt(qty / 1000); // calculate 1000's lot of followers
     
     var start_follower = followers[count * 1000 - 1].follower; // get the start of search for rest of followers
     steem.api.getFollowers(the_user,
         start_follower,
         'blog',
         1000,
         function(err, result) {
             //console.log(result);
             followers = followers.concat(result); //get the rest of followers
             //console.log(followers);
             if (count < i) {
                 count++;
                 get_rest(followers, qty);
             } else {
                 console.log(followers);
                 get_follower_data(followers);
             }
         });
     //console.log(followers);	
 }

 function get_follower_data(followers) {
     var follow = [];
     for (let i = 0; i < followers.length; i++) {
         follow.push(followers[i].follower);
     }
     steem.api.lookupAccountNames(follow, function(err, result) { // steemjs API to find the data for each individual follower
        
         follower_array(result); // put the result to follower array
     });
 }

 function follower_array(result) {
     var user_data = [];

     for (let i = 0; i < result.length; i++) {

         var steem = (parseFloat(result[i].vesting_shares) + parseFloat(result[i].received_vesting_shares) - parseFloat(result[i].delegated_vesting_shares)) * spr;
		// form array of objects to be used in soering function
         user_data[i] = {
             "name": result[i].name,
             "shares": steem.toFixed(0),
             "post_time": result[i].last_post,
             "vote_time": result[i].last_vote_time,
             "created": result[i].created

         };




     }

     write_div(user_data); //send the calculated data to WRITE_DIV for DOM display.
 }




 function write_div(user_data) {
     var key;
	 // Clear screen
     document.getElementById("user").innerHTML = "";
     document.getElementById("sp").innerHTML = "";
     document.getElementById("created").innerHTML = "";
     document.getElementById("post").innerHTML = "";
     document.getElementById("voted").innerHTML = "";
     var timenow = utc_Now(); //calculate current time as UTC


     for (let i = 0; i < user_data.length; i++) {
         var str = "https://steemit.com/@" + user_data[i].name;
         var lin = user_data[i].name;
         $("#user").append(lin.link(str) + "<br />"); // write usernames
         $("#sp").append(user_data[i].shares + "  Steem" + "<br />"); //write user SP

         var crea_time = Date.parse(user_data[i].created);
         var diff = timenow - crea_time;
         var diffdate = parseFloat(diff / (24 * 3600 * 1000));


         $("#created").append(diffdate.toFixed(0) + "  Days Old" + "<br />"); // write account creation date

         var pst_time = Date.parse(user_data[i].post_time);
         var difpost = timenow - pst_time;
         var difhour = parseFloat(difpost / (3600 * 1000));

         if (difhour > 40000) {

             $("#post").append("User never posted!" + "<br />"); //write last post time
         } else {

             $("#post").append(difhour.toFixed(2) + "  Hours Ago" + "<br />");
         }

         var vt_time = Date.parse(user_data[i].vote_time);
         var difvt = timenow - vt_time;
         var difvthour = parseFloat(difvt / (3600 * 1000));
         if (difvthour > 40000) {

             $("#voted").append("User never voted!" + "<br />"); //write last vote time
         } else {

             $("#voted").append(difvthour.toFixed(2) + "  Hours Ago" + "<br />");
         }


     }

	 // EVENT LISTENERS FOR SORTING
     document.getElementById("buttondowndiv_1").addEventListener("click", function() {
         key = 1;
         sort_data(user_data, key);
         write_div(user_data);

     });

     document.getElementById("buttonupdiv_1").addEventListener("click", function() {
         key = 2;
         sort_data(user_data, key);
         write_div(user_data);
     });




     document.getElementById("buttondowndiv_2").addEventListener("click", function() {
         key = 3;
         sort_data(user_data, key);
         write_div(user_data);
     });

     document.getElementById("buttonupdiv_2").addEventListener("click", function() {
         key = 4;
         sort_data(user_data, key);
         write_div(user_data);
     });

     document.getElementById("buttondowndiv_3").addEventListener("click", function() {
         key = 5;
         sort_data(user_data, key);
         write_div(user_data);
     });

     document.getElementById("buttonupdiv_3").addEventListener("click", function() {
         key = 6;
         sort_data(user_data, key);
         write_div(user_data);
     });

     document.getElementById("buttondowndiv_4").addEventListener("click", function() {
         key = 7;
         sort_data(user_data, key);
         write_div(user_data);
     });

     document.getElementById("buttonupdiv_4").addEventListener("click", function() {
         key = 8;
         sort_data(user_data, key);
         write_div(user_data);
     });
     document.getElementById('spinner').style.display = "none";

 }




 function utc_Now() { // Function for calculating current timestamp in UTC
     var now = new Date;
     var utc_now = now.getTime() + now.getTimezoneOffset() * 60000; //convert now to UTC since post date is in UTC
     return (utc_now)
 }




 function sort_data(user_data, key) { //Sorting function
     console.log(key);

     user_data.sort(function(a, b) {

         if (key == 1) {
             return parseFloat(b.shares) - parseFloat(a.shares);
         }

         if (key == 2) {
             return parseFloat(a.shares) - parseFloat(b.shares);
         }


         if (key == 3) {
             return Date.parse(a.created) - Date.parse(b.created);
         }
         if (key == 4) {
             return Date.parse(b.created) - Date.parse(a.created);
         }

         if (key == 5) {
             return Date.parse(a.post_time) - Date.parse(b.post_time);
         }

         if (key == 6) {
             return Date.parse(b.post_time) - Date.parse(a.post_time);
         }


         if (key == 7) {
             return Date.parse(a.vote_time) - Date.parse(b.vote_time);
         }

         if (key == 8) {
             return Date.parse(b.vote_time) - Date.parse(a.vote_time);
         }

     });

 }