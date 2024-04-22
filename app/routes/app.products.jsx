import {authenticate} from "../shopify.server";
import { json } from "@remix-run/node";
import { useLoaderData, Form, Link, useNavigate } from "@remix-run/react";
import { Box, FormLayout, TextField, Button, Layout, Page,IndexTable, Card, Pagination } from "@shopify/polaris";
import { useMemo} from "react";

export async function loader({request}){
    const { admin } = await authenticate.admin(request);

    const url = new URL(request.url);
    const searchParam = url.searchParams;
    const rel = searchParam.get('rel');
    const cursor = searchParam.get('cursor');
    let searchString = `first: 5`;

    if(cursor && rel) {
        if(rel == "next") {
            searchString += `, after: "${cursor}"`;
        } else {
            searchString = `last: 5, before: "${cursor}"`;
        }
    }

    const response = await admin.graphql(
        `{
            products(${searchString}) {
                nodes {
                  id
                  title
                  description
                  status
                }
                pageInfo {
                    hasPreviousPage
                    hasNextPage
                    startCursor
                    endCursor
                }
            }
        }`,
    );

    const parsedResponse = await response.json();
    const product = parsedResponse.data.products.nodes;
    const pageInfo = parsedResponse.data.products.pageInfo;

    console.log("Product ======>", product);
    console.log("Page ======>", pageInfo);

  return json({ product, pageInfo });
}

export default function productPage(){
    const { product, pageInfo} = useLoaderData();
    const navigate = useNavigate();
    const pagination = useMemo(() => {
        const { hasNextPage, hasPreviousPage, startCursor, endCursor } =  pageInfo || {};

        return {
            previous: {
                disabled: !hasPreviousPage || !startCursor,
                link: `/app/shopifydata/?rel=previous&cursor=${startCursor}`,                  
            },
            next: {
                disabled: !hasNextPage || !endCursor,
                link: `/app/shopifydata/?rel=next&cursor=${endCursor}`,
            },
        };
    }, [pageInfo]);

    const rowMarkup = product.map(
        ({ id, title, description, status }, index) => (
            <IndexTable.Row id={id} key={id} position={index}>
                <IndexTable.Cell> {id.replace("gid://shopify/Product/", "")} </IndexTable.Cell>
                <IndexTable.Cell> {title} </IndexTable.Cell>
                <IndexTable.Cell> {description} </IndexTable.Cell>
                <IndexTable.Cell> {status} </IndexTable.Cell>
            </IndexTable.Row>
        )
    );
   return (
    <Page>
        <Card>
            <IndexTable
                itemCount={product.length}
                headings={[
                { title: "Id" },
                { title: "Title" },
                { title: "Description" },
                { title: "Status" },
                ]}
                selectable={false}
            >
            {rowMarkup}
            </IndexTable>

            <div className="navigation">
                <Pagination
                    hasPrevious={!pagination.previous.disabled}
                    onPrevious={() =>navigate(pagination.previous.link)}
                    hasNext={!pagination.next.disabled}
                    onNext={() => navigate(pagination.next.link)}
                />
            </div>
        </Card>
    </Page>
   );
}