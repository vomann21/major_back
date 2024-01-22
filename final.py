#!/usr/bin/env python
# coding: utf-8

# In[1]:

from flask import Flask,jsonify
import numpy as np
import pandas as pd

# In[48]:


laptop_df = pd.read_csv('amaz_laptops.csv')
phone_df = pd.read_csv('amaz_phones.csv')
fridge_df = pd.read_csv('amaz_fridges.csv')
tv_df = pd.read_csv('amaz_tv.csv')
ac_df = pd.read_csv('amaz_ac.csv')
laptopf_df = pd.read_csv('flip_laptop.csv')
phonef_df = pd.read_csv('flip_phones.csv')
fridgef_df = pd.read_csv('flip_fridgess.csv')
tvf_df = pd.read_csv('flip_tv.csv')
acf_df = pd.read_csv('flip_ac.csv')
combined_df = pd.concat([laptop_df,phone_df,fridge_df,tv_df,ac_df,laptopf_df,phonef_df,fridgef_df,tvf_df,acf_df], axis=0, ignore_index=True)
combined_df.to_csv('combined_flipkart_products.csv', index=False)


# In[169]:


desired_title = 'Redmi 10 Power (Power'
index_values = phone_df[phone_df['title'] == desired_title].index.tolist()
# print(index_values)


# In[174]:


desired_title = 'Redmi 10 Power (Power'
index_values = combined_df[combined_df['title'] == desired_title].index.tolist()
# print(index_values)


# In[49]:


num_rows_unique = combined_df.shape[0]
# print(num_rows_unique)


# In[50]:


combined_df


# In[51]:


combined_df.info()


# In[52]:


combined_df.isnull().sum()


# In[114]:


combined_df['price'].fillna('33999', inplace=True)
combined_df['price'] = combined_df['price'].astype(str)


# In[177]:


new_df = pd.concat([laptop_df,phone_df,fridge_df,tv_df,ac_df,laptopf_df,phonef_df,fridgef_df,tvf_df,acf_df], axis=0, ignore_index=True)
new_df.to_csv('new_flipkart_products.csv', index=False)
new_df['price'] = new_df['price'].astype(str)
new_df['description'] = new_df['description'].astype(str)


# In[201]:


def remove_special_characters(text):
    import re
    # Replace all non-alphabetic characters and spaces with an empty string
    return re.sub(r'[^a-zA-Z0-9\s]', '', text)
new_df['price'] = new_df['price'].apply(remove_special_characters)
new_df['description'] = new_df['description'].apply(remove_special_characters)
new_df['brand'] = new_df['brand'].apply(remove_special_characters)
new_df['platform'] = new_df['platform'].apply(remove_special_characters)
new_df['type'] = new_df['type'].apply(remove_special_characters)


# In[202]:


new_df


# In[203]:


new_df['tags'] = new_df['title']+new_df['price']+new_df['description']+new_df['brand']+new_df['type']
new_df.head()
new_df['platform']


# In[204]:

# In[206]:


new_df = new_df[['title','description','brand','platform','type','tags']]




import nltk
from nltk.stem.porter import PorterStemmer
ps = PorterStemmer()


# In[214]:


def stem(text):
    y = []
    for i in text.split():
        y.append(ps.stem(i))
    return " ".join(y)


# In[215]:


new_df['tags']=new_df['tags'].apply(stem)


# In[216]:


new_df['tags']=new_df['tags'].apply(lambda x:x.lower()) 


# In[217]:


new_df['tags']


# In[218]:


from sklearn.feature_extraction.text import CountVectorizer
cv = CountVectorizer(max_features=5000,stop_words='english')


# In[219]:


vectors = cv.fit_transform(new_df['tags']).toarray()


# In[220]:


vectors


# In[221]:


cv.get_feature_names_out()


# In[222]:


from sklearn.metrics.pairwise import cosine_similarity


# In[223]:


cosine_similarity(vectors).shape


# In[224]:


similarity = cosine_similarity(vectors)



app = Flask(__name__)

@app.route('/recommend/<string:title>')
def recommend(title):
    top_n = 20
    product_index = new_df[new_df['title'] == title].index[0]
    distances = similarity[product_index]
    product_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:90]

    result = []
    unique_products = set()
    count = 0

    for i in product_list:
        if count >= top_n:
            break

        product_details = combined_df.iloc[i[0]].description

        # Check if the product details are not already in the set
        if product_details not in unique_products:
            product_details = combined_df.iloc[i[0]].description
            # Add the product details to the set to ensure uniqueness
            unique_products.add(product_details)
            count += 1
            temp = {
                "index" : i[0],
                "title" : new_df.iloc[i[0]].title,
                "price" : combined_df.iloc[i[0]].price,
                "image" : combined_df.iloc[i[0]].image,
                "product_link": combined_df.iloc[i[0]].product_link,
                "brand" : new_df.iloc[i[0]].brand,
                "platform" : new_df.iloc[i[0]].platform 
            }
            result.append(temp)

    ans = {
        "recommended_products": result
    }        
    return jsonify(ans)

if __name__ == "__main__":
    app.run()
