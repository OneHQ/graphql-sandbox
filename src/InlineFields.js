import React from "react";

export default function InlineFields({ fields }) {
  let fieldGroups = [[]];
  let widthCount = 0;
  let key = 0;
  for(const item of fields) {
    widthCount += item.width ? parseInt(item.width.replace("%","")) : 100;
    if (widthCount < 101) {
      fieldGroups[key].push(item);
    }
    else {
      key += 1;
      item.marginLeft = "0";
      fieldGroups.push([]);
      fieldGroups[key].push(item);
      widthCount = parseInt(item.width.replace("%",""));
    }
  }
  return (
    <>
    {fieldGroups.length > 0 && fieldGroups.map((field, idx) =>
      <div key={`inline${idx}`} style={{ display: 'inline-flex' }}>
      {field.map((item, idx) => (
        <div key={`field${idx}`} style={{ width: item.width, marginLeft: item.marginLeft ? item.marginLeft : "" }}>
        {item.field}
        </div>
      ))}
      </div>
    )}
    </>
  );
}
