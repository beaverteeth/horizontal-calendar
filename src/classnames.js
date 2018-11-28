export default function ClassNames(rules) {
    var classes = ''

    Object.keys(rules).forEach(item => {
        if (rules[item])
            classes += (classes.length ? ' ' : '') + item
    })

    return classes
}