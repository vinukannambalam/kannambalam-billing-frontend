const devotees = [

{
    id:1,
    full_name:"Vinayachandran",
    phone:"9999999999",
    family_member:true,
    address:"Kannambalam"
},

{
    id:2,
    full_name:"Hari",
    phone:"8888888888",
    family_member:true,
    address:"Kannambalam"
}

];

export async function getDevotees(){

    return devotees;

}