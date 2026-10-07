/* Store a restricted Quill Delta rather than executable HTML. */
export function normalizeRichContent(value) {
  const invalid=()=>{throw Object.assign(new Error('INVALID_INPUT'),{status:400});};
  if(!value||!Array.isArray(value.ops)||value.ops.length>5000)invalid();
  let length=0;
  const ops=value.ops.map(op=>{
    if(!op||typeof op.insert!=='string')invalid();
    length+=op.insert.length;if(length>30000)invalid();
    const attributes={},input=op.attributes||{};
    for(const name of ['bold','italic','underline','strike','blockquote'])if(input[name]===true)attributes[name]=true;
    for(const name of ['color','background'])if(typeof input[name]==='string'&&/^#[a-f0-9]{6}$/i.test(input[name]))attributes[name]=input[name];
    if(['small','large','huge'].includes(input.size))attributes.size=input.size;
    if([1,2,3].includes(input.header))attributes.header=input.header;
    if(['ordered','bullet'].includes(input.list))attributes.list=input.list;
    if(['center','right','justify'].includes(input.align))attributes.align=input.align;
    const result={insert:op.insert};if(Object.keys(attributes).length)result.attributes=attributes;return result;
  });
  const result={ops};if(JSON.stringify(result).length>100000)invalid();return result;
}
export const richPlainText=content=>content.ops.map(op=>op.insert).join('').trim();
