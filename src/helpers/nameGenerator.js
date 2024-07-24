export function generateName() {
    const n1 = ['Alfa', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu'];
    const n2 = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Niner', 'Zero'];

    let final = "";
    for (let i = 0; i < Math.floor(Math.random() * 7) + 2; i++) {
        if (Math.random() * 2 > 1) {
            final = final + n1[Math.round(Math.random() * (n1.length - 1))] + " ";
        } else {
            final = final + n2[Math.round(Math.random() * (n2.length - 1))] + " ";
        }
        
    }

    return final;
}