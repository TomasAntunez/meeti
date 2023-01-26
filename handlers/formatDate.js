// const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

exports.formatFullDate = (date, time) => {

    const [ year, month, day ] = date.split('-');
    const [ hours, minutes ] = time.split(':');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
};
