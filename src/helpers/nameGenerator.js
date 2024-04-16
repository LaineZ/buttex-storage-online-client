export function generateName() {
    const n1 = ['Blue', 'Green', 'Red', 'Orange', 'Violet', 'Indigo', 'Yellow']
    const n2 = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Zero']
    return n1[Math.round(Math.random() * (n1.length - 1))] + ' ' + n2[Math.round(Math.random() * (n2.length - 1))]
}